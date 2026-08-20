import { useMemo, useState } from 'react'
import { VizStage, VizNode, VizEdge, VizBadge, VizLabel, VizPanel } from '../viz/primitives'
import { VizControls, VizFigure, VizSlider, VizToggle } from '../viz/controls'
import { usePlayback } from '../viz/usePlayback'
import { clamp, type Box, type Point } from '../viz/geometry'

/**
 * Quorum reads and writes, and the arithmetic that makes them correct.
 *
 * The claim is R + W > N. The reader can break it with the sliders and watch a
 * stale read come back. The second control matters more than the first: with
 * R + W <= N the system still returns the right answer most of the time, which
 * is exactly why the bug survives testing and ships.
 */

const W_STAGE = 1040
const H_STAGE = 440

const CLIENT: Box = { x: 30, y: 197, w: 130, h: 46 }
const COORD: Box = { x: 210, y: 191, w: 170, h: 58 }

const REPLICA_X = 440
const REPLICA_W = 150
const REPLICA_H = 42
const REPLICA_GAP = 10

/** Left edge and width of the write-set, read-set and intersection chips. */
const CHIPS = [
  { x: 604, w: 24, text: 'W', header: 'W' },
  { x: 634, w: 24, text: 'R', header: 'R' },
  { x: 664, w: 40, text: 'both', header: 'BOTH' },
] as const

function replicaBox(index: number, count: number): Box {
  const columnHeight = count * REPLICA_H + (count - 1) * REPLICA_GAP
  const top = (H_STAGE - columnHeight) / 2
  return { x: REPLICA_X, y: top + index * (REPLICA_H + REPLICA_GAP), w: REPLICA_W, h: REPLICA_H }
}

/**
 * Give every replica its own ordered port on the coordinator. The edges leave
 * the right side without stacking on one point, then enter each replica at the
 * centre of its left edge. This keeps the fan-out legible at every node count.
 */
function coordinatorPort(index: number, count: number): Point {
  const padding = 8
  const available = COORD.h - padding * 2
  const y =
    count === 1 ? COORD.y + COORD.h / 2 : COORD.y + padding + (index * available) / (count - 1)
  return { x: COORD.x + COORD.w + 3, y }
}

function replicaPort(index: number, count: number): Point {
  const box = replicaBox(index, count)
  return { x: box.x - 3, y: box.y + box.h / 2 }
}

type Result = 'fresh' | 'stale' | 'no-write-quorum' | 'no-read-quorum'

const STEPS = [
  {
    label: 'Write',
    note: 'The client sends a new version of one key to the coordinator. Nothing is durable yet and nothing has been decided.',
  },
  {
    label: 'Fan out',
    note: 'The coordinator forwards the write to every replica it can reach. It does not wait for all of them.',
  },
  {
    label: 'Acknowledge at W',
    note: 'As soon as W replicas confirm, the write is acknowledged to the client. The replicas that confirmed now hold v2. The rest still hold v1, and the client has already moved on.',
  },
  {
    label: 'Read',
    note: 'A read arrives. The coordinator queries R replicas and will return the newest version among the answers. Which R it picks is the whole question.',
  },
  {
    label: 'Answer',
    note: 'The answer is only as fresh as the freshest replica the read happened to touch.',
  },
] as const

export default function QuorumDemo() {
  const [nodes, setNodes] = useState(5)
  const [writeQuorum, setWriteQuorum] = useState(3)
  const [readQuorum, setReadQuorum] = useState(3)
  const [offline, setOffline] = useState(0)
  const [adversarial, setAdversarial] = useState(true)

  const playback = usePlayback(STEPS.length, 1600)
  const step = Math.min(playback.step, STEPS.length - 1)
  const current = STEPS[step]!

  // The sliders are clamped on read rather than corrected on write, so the
  // component holds no state that contradicts what is on screen.
  const n = nodes
  const w = clamp(writeQuorum, 1, n)
  const r = clamp(readQuorum, 1, n)
  const down = Math.min(offline, n)

  const model = useMemo(() => {
    const online = Array.from({ length: n - down }, (_, i) => i)
    const writeOk = online.length >= w
    const readOk = online.length >= r

    const writeSet = writeOk ? online.slice(0, w) : []
    const inWrite = new Set(writeSet)

    // Worst case: prefer replicas that did not take the write. If R + W > N no
    // such choice exists for all R slots, which is the whole point.
    const ranked = adversarial
      ? [...online].sort((a, b) => Number(inWrite.has(a)) - Number(inWrite.has(b)) || a - b)
      : online
    const readSet = readOk ? ranked.slice(0, r) : []

    const overlap = readSet.filter((i) => inWrite.has(i)).length
    const guaranteed = Math.max(0, r + w - n)

    const result: Result = !writeOk
      ? 'no-write-quorum'
      : !readOk
        ? 'no-read-quorum'
        : overlap > 0
          ? 'fresh'
          : 'stale'

    return { online, writeSet, readSet, inWrite, overlap, guaranteed, result, writeOk, readOk }
  }, [adversarial, down, n, r, w])

  const isDown = (i: number) => i >= n - down
  const showWriteChips = step >= 2
  const showReadChips = step >= 3
  const showOverlap = step >= 4
  const hasV2 = (i: number) => step >= 2 && model.inWrite.has(i)

  const resultText: Record<Result, string> = {
    fresh: 'FRESH · returned v2',
    stale: 'STALE · returned v1',
    'no-write-quorum': 'NO WRITE QUORUM',
    'no-read-quorum': 'NO READ QUORUM',
  }

  const returnsText: Record<Result, string> = {
    fresh: 'v2 (fresh)',
    stale: 'v1 (stale)',
    'no-write-quorum': 'write failed',
    'no-read-quorum': 'read failed',
  }

  const narration =
    'Animated diagram of a quorum read and write across a set of replicas. A client sends a new version of a key to a coordinator, the coordinator forwards it to every reachable replica, and the write is acknowledged as soon as W replicas confirm. Only those W replicas hold the new version; the rest still hold the old one. A read then arrives, the coordinator queries R replicas, and it returns the newest version among the answers. Chips beside each replica mark which replicas took the write, which ones the read touched, and which are in both sets. When R plus W is greater than the replica count the two sets must share at least one replica, so a read cannot miss an acknowledged write. Sliders let the reader shrink R or W until the sum is no larger than the replica count, at which point a read set exists that avoids the write set completely and the answer comes back stale. A further control switches the read set between a worst-case choice and a naive first-available one, which usually overlaps by luck and hides the flaw. A final slider takes replicas offline until no write quorum can be formed at all.'

  return (
    <VizFigure
      caption={
        <>
          <strong>{current.label}.</strong> {current.note}
        </>
      }
    >
      <VizStage width={W_STAGE} height={H_STAGE} narration={narration}>
        <VizLabel at={{ x: 95, y: 26 }} text="CLIENT" />
        <VizLabel at={{ x: 295, y: 26 }} text="COORDINATOR" />
        <VizLabel at={{ x: 515, y: 26 }} text="REPLICAS" />
        {CHIPS.map((chip) => (
          <VizLabel key={chip.header} at={{ x: chip.x + chip.w / 2, y: 26 }} text={chip.header} />
        ))}
        <VizLabel at={{ x: 867, y: 26 }} text="THE OVERLAP RULE" />

        {/* Static topology, dim, under whatever this step is doing. */}
        <g className="viz-graph-edges">
          {Array.from({ length: n }, (_, i) => (
            <VizEdge
              key={`base-${i}`}
              from={COORD}
              to={replicaBox(i, n)}
              fromPoint={coordinatorPort(i, n)}
              toPoint={replicaPort(i, n)}
              route="horizontal"
              tone="muted"
              variant="dashed"
            />
          ))}

          {/* Only the client edge carries a label. The coordinator sits close
           * enough to the replica column that a mid-edge label would land on
           * top of a box at every replica count. */}
          {step === 0 && <VizEdge from={CLIENT} to={COORD} tone="accent" label="PUT v2" active />}

          {step === 1 &&
            model.online.map((i) => (
              <VizEdge
                key={`out-${i}`}
                from={COORD}
                to={replicaBox(i, n)}
                fromPoint={coordinatorPort(i, n)}
                toPoint={replicaPort(i, n)}
                route="horizontal"
                tone="accent"
                active
              />
            ))}

          {step === 2 &&
            model.writeSet.map((i) => (
              <VizEdge
                key={`ack-${i}`}
                from={replicaBox(i, n)}
                to={COORD}
                fromPoint={replicaPort(i, n)}
                toPoint={coordinatorPort(i, n)}
                route="horizontal"
                tone="success"
                active
              />
            ))}

          {step === 3 &&
            model.readSet.map((i) => (
              <VizEdge
                key={`get-${i}`}
                from={COORD}
                to={replicaBox(i, n)}
                fromPoint={coordinatorPort(i, n)}
                toPoint={replicaPort(i, n)}
                route="horizontal"
                tone="accent"
                active
              />
            ))}

          {step === 4 && (
            <>
              {model.readSet.map((i) => (
                <VizEdge
                  key={`ret-${i}`}
                  from={replicaBox(i, n)}
                  to={COORD}
                  fromPoint={replicaPort(i, n)}
                  toPoint={coordinatorPort(i, n)}
                  route="horizontal"
                  tone={model.result === 'fresh' ? 'success' : 'danger'}
                  active
                />
              ))}
              <VizEdge
                from={COORD}
                to={CLIENT}
                tone={model.result === 'fresh' ? 'success' : 'danger'}
                label={model.result === 'fresh' ? 'v2' : 'v1'}
                active
              />
            </>
          )}
        </g>

        <g className="viz-graph-nodes">
          <VizNode
            box={CLIENT}
            title="client"
            subtitle="one key, one value"
            tone="accent"
            active={step === 0 || step === 4}
          />
          <VizNode
            box={COORD}
            title="coordinator"
            subtitle={`W = ${w} · R = ${r} of N = ${n}`}
            tone={model.result === 'fresh' ? 'success' : 'default'}
            active={step > 0}
          />

          {Array.from({ length: n }, (_, i) => {
            const box = replicaBox(i, n)
            const dead = isDown(i)
            return (
              <VizNode
                key={`replica-${i}`}
                box={box}
                title={`replica ${i + 1}`}
                subtitle={dead ? 'offline' : hasV2(i) ? 'v2 · current' : 'v1 · stale'}
                tone={dead ? 'danger' : hasV2(i) ? 'success' : 'muted'}
                ghost={dead}
                active={
                  (step === 1 && !dead) ||
                  (step === 2 && model.inWrite.has(i)) ||
                  (step >= 3 && model.readSet.includes(i))
                }
              />
            )
          })}
        </g>

        {/* Set membership, spelled out. The third column is the guarantee. */}
        <g className="viz-set-chips">
          {Array.from({ length: n }, (_, i) => {
            const y = replicaBox(i, n).y + 12
            const member = [
              showWriteChips && model.inWrite.has(i),
              showReadChips && model.readSet.includes(i),
              showOverlap && model.inWrite.has(i) && model.readSet.includes(i),
            ]
            return (
              <g key={`chips-${i}`}>
                {CHIPS.map((chip, c) => (
                  <VizBadge
                    key={chip.header}
                    at={{ x: chip.x, y }}
                    width={chip.w}
                    text={chip.text}
                    tone={c === 0 ? 'success' : 'accent'}
                    ghost={!member[c]}
                  />
                ))}
              </g>
            )
          })}
        </g>

        <VizPanel
          at={{ x: 724, y: 52 }}
          width={286}
          title="THIS CONFIGURATION"
          rows={[
            { label: 'replicas, N', value: String(n) },
            { label: 'write quorum, W', value: String(w) },
            { label: 'read quorum, R', value: String(r) },
            {
              label: 'R + W vs N',
              value: `${r + w} ${r + w > n ? '>' : '≤'} ${n}`,
              tone: r + w > n ? 'success' : 'danger',
            },
            {
              label: 'guaranteed overlap',
              value:
                model.guaranteed > 0
                  ? `${model.guaranteed} replica${model.guaranteed > 1 ? 's' : ''}`
                  : 'none',
              tone: model.guaranteed > 0 ? 'success' : 'danger',
            },
            {
              label: 'overlap this run',
              value: showOverlap
                ? `${model.overlap} replica${model.overlap === 1 ? '' : 's'}`
                : '—',
              tone: showOverlap ? (model.overlap > 0 ? 'success' : 'danger') : 'muted',
            },
            { label: 'replicas offline', value: String(down), tone: down > 0 ? 'danger' : 'muted' },
            {
              label: 'read set chosen',
              value: adversarial ? 'worst case' : 'first available',
              tone: adversarial ? 'default' : 'muted',
            },
            {
              label: 'read returns',
              value: showOverlap ? returnsText[model.result] : '—',
              tone: showOverlap ? (model.result === 'fresh' ? 'success' : 'danger') : 'muted',
            },
          ]}
        />

        <VizLabel at={{ x: 867, y: 314 }} text="R + W > N  ⇒  THE TWO SETS MUST TOUCH" />

        {step >= 4 && (
          <VizBadge
            at={{ x: COORD.x, y: 268 }}
            width={COORD.w}
            text={resultText[model.result]}
            tone={model.result === 'fresh' ? 'success' : 'danger'}
          />
        )}
      </VizStage>

      <VizControls playback={playback} totalSteps={STEPS.length} phaseLabel={current.label}>
        <VizSlider
          label="N"
          value={n}
          min={3}
          max={7}
          step={2}
          onChange={(v) => {
            setNodes(v)
            playback.reset()
          }}
        />
        <VizSlider label="W" value={w} min={1} max={n} onChange={setWriteQuorum} />
        <VizSlider label="R" value={r} min={1} max={n} onChange={setReadQuorum} />
        <VizSlider label="Offline" value={down} min={0} max={3} onChange={setOffline} />
        <VizToggle
          label="Worst-case read set"
          tone="danger"
          checked={adversarial}
          onChange={setAdversarial}
          ariaLabel="Choose the read set that avoids the write set wherever possible"
        />
      </VizControls>
    </VizFigure>
  )
}
