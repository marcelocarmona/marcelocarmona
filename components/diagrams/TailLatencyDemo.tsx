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
import type { PanelRow } from '../viz/primitives'
import { VizButton, VizControls, VizFigure, VizSlider, VizToggle } from '../viz/controls'
import { usePlayback } from '../viz/usePlayback'
import { clamp, percentile, rng, type Box, type Point } from '../viz/geometry'

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

/** Longest latency the model can produce, and therefore the end of the axis. */
const MAX_MS = 900

/** Below this the topology and the readout stop fitting beside the chart. */
const STACK_BELOW = 760

type TailLayout = {
  width: number
  height: number
  stacked: boolean
  client: Box
  coord: Box
  panel: { x: number; y: number; width: number }
  panelRows: 'full' | 'essential'
  chart: { x0: number; x1: number; top: number; height: number }
  axisY: number
  /** Fewer ticks on a narrow axis: labels that collide are worse than no labels. */
  axisTicks: number[]
  /** The fan-out spine, or null where there is no horizontal room for one. */
  spine: { x: number; from: Point } | null
  markerBadgeY: number
  heading: Point
  strip: { labelX: number; rows: { labelY: number; lineY: number }[] }
}

const FULL_TICKS = [0, 150, 300, 450, 600, 750, 900]
const SPARSE_TICKS = [0, 300, 600, 900]

function buildLayout(width: number): TailLayout {
  if (width >= STACK_BELOW) {
    const margin = 30
    const columnWidth = clamp(Math.round(width * 0.235), 210, 250)
    const coord: Box = { x: margin, y: 102, w: columnWidth, h: 48 }
    const spineX = margin + columnWidth + 36
    const chart = { x0: spineX + 20, x1: width - 35, top: 60, height: 388 }

    return {
      width,
      height: 580,
      stacked: false,
      client: { x: margin, y: 40, w: columnWidth, h: 44 },
      coord,
      panel: { x: margin, y: 176, width: columnWidth },
      panelRows: 'full',
      chart,
      axisY: 470,
      axisTicks: chart.x1 - chart.x0 >= 420 ? FULL_TICKS : SPARSE_TICKS,
      spine: { x: spineX, from: { x: margin + columnWidth, y: coord.y + coord.h / 2 } },
      markerBadgeY: 450,
      heading: { x: (chart.x0 + chart.x1) / 2, y: 26 },
      strip: {
        labelX: margin,
        rows: [
          { labelY: 522, lineY: 518 },
          { labelY: 562, lineY: 558 },
        ],
      },
    }
  }

  const margin = 12
  const chartHeight = clamp(Math.round(width * 0.62), 190, 260)
  const chart = { x0: margin, x1: width - margin, top: 158, height: chartHeight }
  const axisY = chart.top + chartHeight + 14
  const panelY = axisY + 124
  // Held to a readable measure and centred, for the same reason the chart is
  // not: a label and its value have to read as one row.
  const panelWidth = Math.min(width - margin * 2, 460)

  return {
    width,
    height: panelY + 40 + 7 * 22 + 16,
    stacked: true,
    client: { x: margin, y: 6, w: width - margin * 2, h: 40 },
    coord: { x: margin, y: 58, w: width - margin * 2, h: 46 },
    panel: { x: Math.round((width - panelWidth) / 2), y: panelY, width: panelWidth },
    panelRows: 'essential',
    chart,
    axisY,
    axisTicks: SPARSE_TICKS,
    spine: null,
    markerBadgeY: axisY - 22,
    heading: { x: width / 2, y: 126 },
    strip: {
      labelX: chart.x0,
      // The row label sits well above its scale: the p50 dot is only a few
      // pixels in from the left, and its own label shares that line.
      rows: [
        { labelY: axisY + 34, lineY: axisY + 60 },
        { labelY: axisY + 82, lineY: axisY + 108 },
      ],
    },
  }
}

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

  const showBars = step >= 1
  const showSlowest = step >= 2
  const showAggregate = step >= 3

  const slowestIndex = sim.sample.reduce(
    (best, d, i) => (d.ms > sim.sample[best]!.ms ? i : best),
    0
  )

  const ms = (v: number) => `${Math.round(v)} ms`

  const panelRows: PanelRow[] = [
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
  ]

  /** The comparison still holds with the medians and the p50s dropped. */
  const essentialRows = [0, 1, 3, 5, 7, 8, 9]

  const narration =
    'Animated diagram of tail latency under fan-out. A coordinator turns one incoming request into one request per shard and cannot answer until the slowest of them replies, so each shard is drawn as a horizontal bar whose length is its response time and the answer arrives at the longest bar. A vertical marker shows where that slowest bar lands, and a dashed line marks the ninety-ninth percentile of a single shard as a fixed yardstick. Sliders control how many shards the request touches and how often a shard stalls. The readout is computed from three thousand simulated requests and reports the median and ninety-ninth percentile for one shard and for the whole fan-out, together with the share of fan-out requests that finish slower than a single shard would at its ninety-ninth percentile. Raising the shard count drives that share up even though no individual shard has become any slower. A hedging control sends a second copy of any request still outstanding at the ninety-fifth percentile and keeps whichever answer arrives first; the original response time stays visible as a faint bar behind the shortened one, and the readout shows the extra request volume that buys the improvement.'

  return (
    <VizFigure
      onVisibilityChange={playback.setOnScreen}
      caption={
        <>
          <strong>{current.label}.</strong> {current.note}
        </>
      }
    >
      <VizStage layout={buildLayout} narration={narration}>
        {(L) => {
          const x = (v: number) =>
            L.chart.x0 + (Math.min(v, MAX_MS) * (L.chart.x1 - L.chart.x0)) / MAX_MS

          const rowHeight = Math.min(16, L.chart.height / shards)
          const barHeight = Math.max(3, rowHeight - 3)
          const blockTop = L.chart.top + (L.chart.height - shards * rowHeight) / 2
          const rowY = (i: number) => blockTop + i * rowHeight

          const markerX = x(sim.sampleMax)
          const markerBadgeX = Math.min(markerX + 8, L.chart.x1 - 118)

          const spineJoin = L.spine?.from.y ?? 0
          const spineTop = Math.min(blockTop, spineJoin)
          const spineBottom = Math.max(blockTop + shards * rowHeight, spineJoin)

          return (
            <>
              <VizLabel
                at={L.heading}
                text={
                  L.stacked ? 'RESPONSE TIME PER SHARD' : 'RESPONSE TIME PER SHARD, ONE REQUEST'
                }
              />

              <VizEdge from={L.client} to={L.coord} tone="accent" active={step === 0} />
              <VizNode
                box={L.client}
                title="client"
                subtitle="one search request"
                tone="accent"
                active={step === 0}
              />
              <VizNode
                box={L.coord}
                title="coordinator"
                subtitle={`fans out to ${shards} shard${shards === 1 ? '' : 's'}`}
                tone={showSlowest ? 'danger' : 'default'}
                active={step >= 1}
              />

              {/* Fan-out: a spine with one stub per shard. Dropped when stacked,
               * where the coordinator already sits directly above the bars and
               * the stubs would cost 40px of phone screen to say nothing. */}
              {L.spine && (
                <g className="viz-fanout">
                  <VizTick
                    from={L.spine.from}
                    to={{ x: L.spine.x, y: L.spine.from.y }}
                    tone="muted"
                  />
                  <VizTick
                    from={{ x: L.spine.x, y: spineTop }}
                    to={{ x: L.spine.x, y: spineBottom }}
                    tone="muted"
                  />
                  {sim.sample.map((_, i) => (
                    <VizTick
                      key={`stub-${i}`}
                      from={{ x: L.spine!.x, y: rowY(i) + barHeight / 2 }}
                      to={{ x: L.chart.x0 - 4, y: rowY(i) + barHeight / 2 }}
                      tone="muted"
                    />
                  ))}
                </g>
              )}

              <g className="viz-latency-bars">
                {sim.sample.map((draw, i) => (
                  <g key={`bar-${i}`}>
                    {/* What the shard would have cost without a hedged copy. */}
                    {showBars && hedge && draw.raw > draw.ms && (
                      <VizBar
                        at={{ x: L.chart.x0, y: rowY(i) }}
                        width={L.chart.x1 - L.chart.x0}
                        height={barHeight}
                        fraction={draw.raw / MAX_MS}
                        ghost
                      />
                    )}
                    <VizBar
                      at={{ x: L.chart.x0, y: rowY(i) }}
                      width={L.chart.x1 - L.chart.x0}
                      height={barHeight}
                      fraction={showBars ? draw.ms / MAX_MS : 0}
                      tone={
                        showSlowest && i === slowestIndex
                          ? 'danger'
                          : showSlowest
                            ? 'muted'
                            : 'accent'
                      }
                    />
                  </g>
                ))}
              </g>

              {/* One shard's p99, held fixed so hedging can be measured against it. */}
              {showAggregate && (
                <>
                  <VizTick
                    from={{ x: x(sim.baselineP99), y: L.chart.top - 4 }}
                    to={{ x: x(sim.baselineP99), y: L.axisY - 8 }}
                    tone="muted"
                    variant="dashed"
                  />
                  <VizLabel
                    at={{ x: x(sim.baselineP99), y: L.chart.top - 10 }}
                    text="ONE SHARD p99"
                  />
                </>
              )}

              {showSlowest && (
                <>
                  <VizTick
                    from={{ x: markerX, y: L.chart.top - 4 }}
                    to={{ x: markerX, y: L.axisY - 8 }}
                    tone="danger"
                  />
                  <VizBadge
                    at={{ x: markerBadgeX, y: L.markerBadgeY }}
                    width={110}
                    text={`answer at ${ms(sim.sampleMax)}`}
                    tone="danger"
                  />
                </>
              )}

              {/* Axis */}
              <VizTick
                from={{ x: L.chart.x0, y: L.axisY }}
                to={{ x: L.chart.x1, y: L.axisY }}
                tone="muted"
              />
              {L.axisTicks.map((t, i) => (
                <g key={`axis-${t}`}>
                  <VizTick
                    from={{ x: x(t), y: L.axisY }}
                    to={{ x: x(t), y: L.axisY + 5 }}
                    tone="muted"
                  />
                  <VizLabel
                    at={{ x: x(t), y: L.axisY + 18 }}
                    text={t === 0 ? '0' : `${t}ms`}
                    // The end labels are pulled inside the canvas; centred on
                    // the last tick, `900ms` hangs off the right edge.
                    anchor={i === 0 ? 'start' : i === L.axisTicks.length - 1 ? 'end' : 'middle'}
                  />
                </g>
              ))}

              {/* Percentile scales, on the same axis as the bars above them. */}
              <g className="viz-percentile-strip">
                <VizLabel
                  at={{ x: L.strip.labelX, y: L.strip.rows[0]!.labelY }}
                  text="ONE SHARD"
                  anchor="start"
                />
                <VizLabel
                  at={{ x: L.strip.labelX, y: L.strip.rows[1]!.labelY }}
                  text={`FAN-OUT × ${shards}`}
                  anchor="start"
                />
                {[
                  {
                    y: L.strip.rows[0]!.lineY,
                    values: [sim.shardP50, sim.shardP99] as const,
                    tone: 'success' as const,
                  },
                  {
                    y: L.strip.rows[1]!.lineY,
                    values: [sim.fanP50, sim.fanP99] as const,
                    tone: 'danger' as const,
                  },
                ].map((row) => (
                  <g key={row.y}>
                    <VizTick
                      from={{ x: L.chart.x0, y: row.y }}
                      to={{ x: L.chart.x1, y: row.y }}
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
                at={{ x: L.panel.x, y: L.panel.y }}
                width={L.panel.width}
                title="MEASURED OVER 3,000 REQUESTS"
                rows={L.panelRows === 'full' ? panelRows : essentialRows.map((i) => panelRows[i]!)}
              />
            </>
          )
        }}
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
