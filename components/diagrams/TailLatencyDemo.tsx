import { useMemo, useState } from 'react'
import {
  VizStage,
  VizNode,
  VizEdge,
  VizBadge,
  VizBar,
  VizDot,
  VizLabel,
  VizPanel,
  VizTick,
} from '../viz/primitives'
import { VizButton, VizControls, VizFigure, VizSlider, VizToggle } from '../viz/controls'
import { usePlayback } from '../viz/usePlayback'
import { percentile, rng, type Box } from '../viz/geometry'

/**
 * Tail latency under fan-out.
 *
 * A request that waits on N shards is as slow as the slowest of them, so a rare
 * per-shard stall becomes a common end-to-end one. The reader can raise the
 * fan-out and watch a good service turn bad without any individual shard
 * getting worse, which is the part that is hard to believe from prose alone.
 *
 * Every number comes from a seeded simulation run in a `useMemo`. Nothing here
 * calls `Math.random`, so the server and the browser draw the same picture.
 */

const W_STAGE = 1040
const H_STAGE = 580

const CLIENT: Box = { x: 30, y: 40, w: 234, h: 44 }
const COORD: Box = { x: 30, y: 102, w: 234, h: 48 }

const SPINE_X = 300
const CHART_X0 = 320
const CHART_X1 = 1005
const CHART_TOP = 60
const CHART_H = 388
const AXIS_Y = 470

/** Longest latency the model can produce, and therefore the end of the axis. */
const MAX_MS = 900
const SCALE = (CHART_X1 - CHART_X0) / MAX_MS
const AXIS_TICKS = [0, 150, 300, 450, 600, 750, 900]

/** Hedge threshold: the 95th percentile of the unstalled response time. */
const HEDGE_AT = 180

const TRIALS = 3000
const MARGINAL_SAMPLES = 12000

/**
 * Inverse CDF of a shard's normal response time, as straight segments.
 *
 * Piecewise-linear rather than a real lognormal on purpose: it uses nothing but
 * add, subtract, multiply and divide, so no two JavaScript engines can disagree
 * about the result in the last bit and hydration stays quiet.
 */
function baseMs(u: number): number {
  if (u < 0.5) return 20 + (u / 0.5) * 40 //  20 →  60
  if (u < 0.8) return 60 + ((u - 0.5) / 0.3) * 40 //  60 → 100
  if (u < 0.95) return 100 + ((u - 0.8) / 0.15) * 80 // 100 → 180
  return 180 + ((u - 0.95) / 0.05) * 120 // 180 → 300
}

type Draw = { ms: number; raw: number; hedged: boolean }

function drawShard(rand: () => number, slowRate: number): number {
  const ms = baseMs(rand())
  return rand() < slowRate ? ms + 220 + rand() * 380 : ms
}

/** One shard's contribution, with an optional hedged copy racing the original. */
function drawEffective(rand: () => number, slowRate: number, hedge: boolean): Draw {
  const raw = drawShard(rand, slowRate)
  if (!hedge || raw <= HEDGE_AT) return { ms: raw, raw, hedged: false }
  const second = drawShard(rand, slowRate)
  return { ms: Math.min(raw, HEDGE_AT + second), raw, hedged: true }
}

function simulate(seed: number, shards: number, slowRate: number, hedge: boolean) {
  const marginalRand = rng(seed ^ 0x51ed270b)
  const marginal: number[] = []
  for (let i = 0; i < MARGINAL_SAMPLES; i += 1) {
    marginal.push(drawEffective(marginalRand, slowRate, hedge).ms)
  }
  marginal.sort((a, b) => a - b)

  // Always measured without hedging, so it stays a fixed yardstick when the
  // reader turns hedging on. Comparing a distribution against its own moving
  // percentile would hide the improvement entirely.
  const baseRand = rng(seed ^ 0x2545f491)
  const baseline: number[] = []
  for (let i = 0; i < MARGINAL_SAMPLES; i += 1) {
    baseline.push(drawEffective(baseRand, slowRate, false).ms)
  }
  baseline.sort((a, b) => a - b)
  const baselineP99 = percentile(baseline, 0.99)

  const trialRand = rng(seed ^ 0x9e3779b9)
  const maxima: number[] = []
  let hedgesSent = 0
  for (let t = 0; t < TRIALS; t += 1) {
    let slowest = 0
    for (let s = 0; s < shards; s += 1) {
      const draw = drawEffective(trialRand, slowRate, hedge)
      if (draw.hedged) hedgesSent += 1
      if (draw.ms > slowest) slowest = draw.ms
    }
    maxima.push(slowest)
  }
  maxima.sort((a, b) => a - b)

  const sampleRand = rng(seed ^ 0x85ebca6b)
  const sample = Array.from({ length: shards }, () => drawEffective(sampleRand, slowRate, hedge))
  const sampleMax = sample.reduce((m, d) => Math.max(m, d.ms), 0)

  return {
    shardP50: percentile(marginal, 0.5),
    shardP99: percentile(marginal, 0.99),
    fanP50: percentile(maxima, 0.5),
    fanP99: percentile(maxima, 0.99),
    baselineP99,
    pastBaseline: maxima.filter((m) => m > baselineP99).length / TRIALS,
    hedgeRate: hedgesSent / (TRIALS * shards),
    sample,
    sampleMax,
  }
}

const STEPS = [
  {
    label: 'Dispatch',
    note: 'One incoming request becomes one outgoing request per shard. They all leave at the same moment.',
  },
  {
    label: 'Replies land',
    note: 'Each shard answers on its own schedule. Most are quick. Reading any single bar here, you would call this service fast.',
  },
  {
    label: 'Wait for the slowest',
    note: 'The coordinator cannot answer until the last shard replies, so the response time is the longest bar, not the typical one. Every other reply is already sitting in memory doing nothing.',
  },
  {
    label: 'Repeat three thousand times',
    note: 'One request tells you nothing. Across three thousand of them the shape appears. The fan-out inherits the tail of every shard it touches.',
  },
] as const

const x = (ms: number) => CHART_X0 + Math.min(ms, MAX_MS) * SCALE

export default function TailLatencyDemo() {
  const [shards, setShards] = useState(32)
  const [slowPct, setSlowPct] = useState(3)
  const [hedge, setHedge] = useState(false)
  // Chosen, not random: this sample has one clear straggler at 632 ms behind a
  // median of 64 ms, which is the shape the diagram exists to show.
  const [seed, setSeed] = useState(20260851)

  const playback = usePlayback(STEPS.length, 1700)
  const step = Math.min(playback.step, STEPS.length - 1)
  const current = STEPS[step]!

  const sim = useMemo(
    () => simulate(seed, shards, slowPct / 100, hedge),
    [hedge, seed, shards, slowPct]
  )

  const rowHeight = Math.min(16, CHART_H / shards)
  const barHeight = Math.max(3, rowHeight - 3)
  const blockTop = CHART_TOP + (CHART_H - shards * rowHeight) / 2
  const rowY = (i: number) => blockTop + i * rowHeight

  const spineTop = Math.min(blockTop, 126)
  const spineBottom = Math.max(blockTop + shards * rowHeight, 126)

  const showBars = step >= 1
  const showSlowest = step >= 2
  const showAggregate = step >= 3

  const markerX = x(sim.sampleMax)
  const markerBadgeX = Math.min(markerX + 8, CHART_X1 - 118)
  const slowestIndex = sim.sample.reduce(
    (best, d, i) => (d.ms > sim.sample[best]!.ms ? i : best),
    0
  )

  const ms = (v: number) => `${Math.round(v)} ms`

  const narration =
    'Animated diagram of tail latency under fan-out. A coordinator turns one incoming request into one request per shard and cannot answer until the slowest of them replies, so each shard is drawn as a horizontal bar whose length is its response time and the answer arrives at the longest bar. A vertical marker shows where that slowest bar lands, and a dashed line marks the ninety-ninth percentile of a single shard as a fixed yardstick. Sliders control how many shards the request touches and how often a shard stalls. The readout is computed from three thousand simulated requests and reports the median and ninety-ninth percentile for one shard and for the whole fan-out, together with the share of fan-out requests that finish slower than a single shard would at its ninety-ninth percentile. Raising the shard count drives that share up even though no individual shard has become any slower. A hedging control sends a second copy of any request still outstanding at the ninety-fifth percentile and keeps whichever answer arrives first; the original response time stays visible as a faint bar behind the shortened one, and the readout shows the extra request volume that buys the improvement.'

  return (
    <VizFigure
      caption={
        <>
          <strong>{current.label}.</strong> {current.note}
        </>
      }
    >
      <VizStage width={W_STAGE} height={H_STAGE} narration={narration}>
        <VizLabel at={{ x: 660, y: 26 }} text="RESPONSE TIME PER SHARD, ONE REQUEST" />

        <VizEdge from={CLIENT} to={COORD} tone="accent" active={step === 0} />
        <VizNode
          box={CLIENT}
          title="client"
          subtitle="one search request"
          tone="accent"
          active={step === 0}
        />
        <VizNode
          box={COORD}
          title="coordinator"
          subtitle={`fans out to ${shards} shard${shards === 1 ? '' : 's'}`}
          tone={showSlowest ? 'danger' : 'default'}
          active={step >= 1}
        />

        {/* Fan-out: a spine with one stub per shard. */}
        <g className="viz-fanout">
          <VizTick from={{ x: 264, y: 126 }} to={{ x: SPINE_X, y: 126 }} tone="muted" />
          <VizTick
            from={{ x: SPINE_X, y: spineTop }}
            to={{ x: SPINE_X, y: spineBottom }}
            tone="muted"
          />
          {sim.sample.map((_, i) => (
            <VizTick
              key={`stub-${i}`}
              from={{ x: SPINE_X, y: rowY(i) + barHeight / 2 }}
              to={{ x: CHART_X0 - 4, y: rowY(i) + barHeight / 2 }}
              tone="muted"
            />
          ))}
        </g>

        <g className="viz-latency-bars">
          {sim.sample.map((draw, i) => (
            <g key={`bar-${i}`}>
              {/* What the shard would have cost without a hedged copy. */}
              {showBars && hedge && draw.raw > draw.ms && (
                <VizBar
                  at={{ x: CHART_X0, y: rowY(i) }}
                  width={CHART_X1 - CHART_X0}
                  height={barHeight}
                  fraction={draw.raw / MAX_MS}
                  ghost
                />
              )}
              <VizBar
                at={{ x: CHART_X0, y: rowY(i) }}
                width={CHART_X1 - CHART_X0}
                height={barHeight}
                fraction={showBars ? draw.ms / MAX_MS : 0}
                tone={
                  showSlowest && i === slowestIndex ? 'danger' : showSlowest ? 'muted' : 'accent'
                }
              />
            </g>
          ))}
        </g>

        {/* One shard's p99, held fixed so hedging can be measured against it. */}
        {showAggregate && (
          <>
            <VizTick
              from={{ x: x(sim.baselineP99), y: CHART_TOP - 4 }}
              to={{ x: x(sim.baselineP99), y: AXIS_Y - 8 }}
              tone="muted"
              variant="dashed"
            />
            <VizLabel at={{ x: x(sim.baselineP99), y: CHART_TOP - 10 }} text="ONE SHARD p99" />
          </>
        )}

        {showSlowest && (
          <>
            <VizTick
              from={{ x: markerX, y: CHART_TOP - 4 }}
              to={{ x: markerX, y: AXIS_Y - 8 }}
              tone="danger"
            />
            <VizBadge
              at={{ x: markerBadgeX, y: 450 }}
              width={110}
              text={`answer at ${ms(sim.sampleMax)}`}
              tone="danger"
            />
          </>
        )}

        {/* Axis */}
        <VizTick from={{ x: CHART_X0, y: AXIS_Y }} to={{ x: CHART_X1, y: AXIS_Y }} tone="muted" />
        {AXIS_TICKS.map((t) => (
          <g key={`axis-${t}`}>
            <VizTick from={{ x: x(t), y: AXIS_Y }} to={{ x: x(t), y: AXIS_Y + 5 }} tone="muted" />
            <VizLabel at={{ x: x(t), y: AXIS_Y + 18 }} text={t === 0 ? '0' : `${t}ms`} />
          </g>
        ))}

        {/* Percentile scales, on the same axis as the bars above them. */}
        <g className="viz-percentile-strip">
          <VizLabel at={{ x: 30, y: 522 }} text="ONE SHARD" anchor="start" />
          <VizLabel at={{ x: 30, y: 562 }} text={`FAN-OUT × ${shards}`} anchor="start" />
          {[
            { y: 518, values: [sim.shardP50, sim.shardP99] as const, tone: 'success' as const },
            { y: 558, values: [sim.fanP50, sim.fanP99] as const, tone: 'danger' as const },
          ].map((row) => (
            <g key={row.y}>
              <VizTick
                from={{ x: CHART_X0, y: row.y }}
                to={{ x: CHART_X1, y: row.y }}
                tone="muted"
                variant="dashed"
              />
              {showAggregate &&
                row.values.map((value, i) => (
                  <VizDot
                    key={i}
                    at={{ x: x(value), y: row.y }}
                    radius={4}
                    tone={i === 0 ? 'success' : row.tone}
                    label={`${i === 0 ? 'p50' : 'p99'} ${ms(value)}`}
                  />
                ))}
            </g>
          ))}
        </g>

        <VizPanel
          at={{ x: 30, y: 176 }}
          width={234}
          title="MEASURED OVER 3,000 REQUESTS"
          rows={[
            { label: 'shards queried', value: String(shards) },
            { label: 'slow-shard rate', value: `${slowPct}%` },
            {
              label: 'hedged retries',
              value: hedge ? `at ${HEDGE_AT} ms` : 'off',
              tone: hedge ? 'accent' : 'muted',
            },
            {
              label: 'this request',
              value: showBars ? ms(sim.sampleMax) : '—',
              tone: showSlowest ? 'danger' : 'muted',
            },
            {
              label: 'one shard · p50',
              value: showAggregate ? ms(sim.shardP50) : '—',
              tone: 'muted',
            },
            {
              label: 'one shard · p99',
              value: showAggregate ? ms(sim.shardP99) : '—',
              tone: 'muted',
            },
            { label: 'fan-out · p50', value: showAggregate ? ms(sim.fanP50) : '—' },
            { label: 'fan-out · p99', value: showAggregate ? ms(sim.fanP99) : '—', tone: 'danger' },
            {
              label: 'past the p99 line',
              value: showAggregate ? `${Math.round(sim.pastBaseline * 100)}%` : '—',
              tone: showAggregate ? (sim.pastBaseline > 0.15 ? 'danger' : 'success') : 'muted',
            },
            {
              label: 'extra requests',
              value: hedge ? `+${Math.round(sim.hedgeRate * 100)}%` : 'none',
              tone: hedge ? 'accent' : 'muted',
            },
          ]}
        />
      </VizStage>

      <VizControls playback={playback} totalSteps={STEPS.length} phaseLabel={current.label}>
        <VizSlider label="Shards" value={shards} min={1} max={64} onChange={setShards} />
        <VizSlider
          label="Slow rate"
          value={slowPct}
          min={1}
          max={10}
          unit="%"
          onChange={setSlowPct}
        />
        <VizToggle
          label="Hedge at p95"
          checked={hedge}
          onChange={setHedge}
          ariaLabel="Send a second copy of any request still outstanding at the 95th percentile"
        />
        <VizButton
          label="New request"
          ariaLabel="Draw a fresh sample request"
          onClick={() => setSeed((s) => (s * 1664525 + 1013904223) >>> 0)}
        />
      </VizControls>
    </VizFigure>
  )
}
