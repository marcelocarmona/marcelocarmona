import { useMemo, useState } from 'react'
import {
  VizStage,
  VizArc,
  VizBadge,
  VizBar,
  VizDot,
  VizLabel,
  VizPanel,
  VizTick,
  type Owner,
  type PanelRow,
} from '../viz/primitives'
import { VizButton, VizControls, VizFigure, VizSlider, VizToggle } from '../viz/controls'
import { usePlayback } from '../viz/usePlayback'
import { hashAngle, hash32, pointOnCircle, clamp, type Point } from '../viz/geometry'

/**
 * Key placement under node churn: consistent hashing against `hash % N`.
 *
 * The claim being tested is that consistent hashing moves 1/N of the keys when
 * a node leaves while modulo moves nearly all of them. The reader can switch
 * schemes, add and remove nodes, and change how many tokens each node claims.
 * Every number in the readout is counted from the same assignment that drew the
 * picture, so the diagram cannot show one thing and report another.
 */

const NODE_NAMES = ['A', 'B', 'C', 'D', 'E', 'F'] as const
const KEY_COUNT = 160

/**
 * Below this the ring and the readout stop fitting side by side, so the
 * diagram stacks: ring, then load bars, then readout. Chosen from the content
 * — a ring narrower than about 280px cannot hold its own centre label.
 */
const STACK_BELOW = 720

type RingLayout = {
  width: number
  height: number
  stacked: boolean
  ring: { at: Point; radius: number }
  bars: { x: number; y: number; width: number; step: number }
  panel: { x: number; y: number; width: number }
  /** Fewer readout rows on a phone: the four that carry the argument. */
  panelRows: 'full' | 'essential'
  headings: { keyspace: Point; load: Point }
}

/**
 * Ring radii, all derived from one number.
 *
 * Keeping them in a fixed ratio means the ring shrinks as a whole. Scaling the
 * band but not the key orbits would let the dots wander into the arcs at small
 * sizes and quietly break what the picture claims.
 */
function ringRadii(radius: number) {
  return {
    bandInner: radius * 0.719,
    bandOuter: radius * 0.818,
    tickInner: radius * 0.818,
    tickOuter: radius * 0.86,
    keyOrbit: radius * 0.926,
    /** Keys that changed owner are pushed to a second orbit. Motion is the message. */
    keyOrbitMoved: radius,
  }
}

function buildLayout(width: number): RingLayout {
  // The load bars always reserve room for every node the cluster can hold, so
  // adding or removing one moves the ring's readout instead of reflowing the
  // article underneath it.
  const barRows = NODE_NAMES.length

  if (width >= STACK_BELOW) {
    const margin = 24
    const panelWidth = clamp(Math.round(width * 0.4), 300, 400)
    const columnX = width - panelWidth - margin
    const ringSpace = columnX - margin - 16
    const radius = clamp(Math.round(ringSpace / 2 - 8), 130, 242)
    const barsY = 64
    const panelY = barsY + barRows * 40 + 8
    const ringCy = 56 + radius

    return {
      width,
      height: Math.max(ringCy + radius + 20, panelY + 40 + 6 * 22 + 24),
      stacked: false,
      ring: { at: { x: Math.round(margin + ringSpace / 2), y: ringCy }, radius },
      bars: { x: columnX, y: barsY, width: panelWidth, step: 40 },
      panel: { x: columnX, y: panelY, width: panelWidth },
      panelRows: 'full',
      headings: {
        keyspace: { x: Math.round(margin + ringSpace / 2), y: 26 },
        load: { x: columnX + panelWidth / 2, y: 26 },
      },
    }
  }

  const margin = 12
  const radius = clamp(Math.round(width / 2 - 30), 96, 200)
  const ringCy = 34 + radius
  const barsY = ringCy + radius + 44
  const panelY = barsY + barRows * 30 + 20
  // Held to a readable measure and centred: stretched across a 640px stage, a
  // label and its value stop reading as one row.
  const panelWidth = Math.min(width - margin * 2, 460)

  return {
    width,
    height: panelY + 40 + 4 * 22 + 16,
    stacked: true,
    ring: { at: { x: Math.round(width / 2), y: ringCy }, radius },
    bars: { x: margin, y: barsY, width: width - margin * 2, step: 30 },
    panel: { x: Math.round((width - panelWidth) / 2), y: panelY, width: panelWidth },
    panelRows: 'essential',
    headings: {
      keyspace: { x: Math.round(width / 2), y: 18 },
      load: { x: Math.round(width / 2), y: barsY - 24 },
    },
  }
}

/** Hashed once at module load. Pure, so the server and the browser agree. */
const KEY_ANGLES = Array.from({ length: KEY_COUNT }, (_, i) =>
  hashAngle(`key-${String(i).padStart(4, '0')}`)
)
const KEY_HASHES = Array.from({ length: KEY_COUNT }, (_, i) =>
  hash32(`key-${String(i).padStart(4, '0')}`)
)

type Scheme = 'ring' | 'modulo'

type Token = { deg: number; node: number }

function tokensFor(live: number[], perNode: number): Token[] {
  const tokens: Token[] = []
  for (const node of live) {
    for (let t = 0; t < perNode; t += 1) {
      tokens.push({ deg: hashAngle(`${NODE_NAMES[node]}#${t}`), node })
    }
  }
  return tokens.sort((a, b) => a.deg - b.deg)
}

/** Owning node index for every key, under the given scheme and cluster. */
function assign(live: number[], scheme: Scheme, tokens: Token[]): number[] {
  if (live.length === 0) return KEY_ANGLES.map(() => -1)

  if (scheme === 'modulo') {
    // Ownership is a remainder, so it depends on the size of the cluster and
    // nothing else. Change the size and every key is reconsidered.
    return KEY_HASHES.map((h) => live[h % live.length]!)
  }

  return KEY_ANGLES.map((deg) => {
    // The first token clockwise from the key owns it; past the last token the
    // search wraps to the first.
    const hit = tokens.find((t) => t.deg >= deg) ?? tokens[0]!
    return hit.node
  })
}

const STEPS = [
  {
    label: 'Steady state',
    note: 'Every key is hashed to a position on the circle. Under consistent hashing a key belongs to the first node token clockwise from it, so each node owns a set of arcs rather than a list of keys.',
  },
  {
    label: 'A node leaves',
    note: 'One node goes away. Its keys have no owner for a moment. Nothing else about the ring has changed, and the surviving tokens are still exactly where they were.',
  },
  {
    label: 'Reassign',
    note: 'The assignment runs again. Keys that changed hands are pushed to the outer orbit. Under consistent hashing only the departed arcs move, and they move to whichever node sits next clockwise.',
  },
  {
    label: 'Count the damage',
    note: 'The readout counts the keys that changed owner. That count is the cost of the node leaving, in cache misses, in re-replication, in cold reads.',
  },
] as const

export default function HashRingDemo() {
  const [scheme, setScheme] = useState<Scheme>('ring')
  const [nodeCount, setNodeCount] = useState(5)
  const [perNode, setPerNode] = useState(8)

  const playback = usePlayback(STEPS.length, 1800)
  const step = Math.min(playback.step, STEPS.length - 1)
  const current = STEPS[step]!

  const model = useMemo(() => {
    const liveBefore = Array.from({ length: nodeCount }, (_, i) => i)
    const liveAfter = liveBefore.slice(0, nodeCount - 1)
    const failed = nodeCount - 1

    const tokensBefore = tokensFor(liveBefore, perNode)
    const tokensAfter = tokensFor(liveAfter, perNode)

    const before = assign(liveBefore, scheme, tokensBefore)
    const after = assign(liveAfter, scheme, tokensAfter)
    const moved = before.reduce((n, owner, i) => (owner === after[i] ? n : n + 1), 0)

    return { liveBefore, liveAfter, failed, tokensBefore, tokensAfter, before, after, moved }
  }, [nodeCount, perNode, scheme])

  const showAfter = step >= 2
  const owners = showAfter ? model.after : model.before
  const tokens = showAfter ? model.tokensAfter : model.tokensBefore
  const live = showAfter ? model.liveAfter : model.liveBefore

  const counts = model.liveBefore.map((n) =>
    owners.reduce((acc, o) => (o === n ? acc + 1 : acc), 0)
  )
  const liveShares = live.map((n) => (counts[n]! / KEY_COUNT) * 100)
  const spreadLow = liveShares.length ? Math.min(...liveShares) : 0
  const spreadHigh = liveShares.length ? Math.max(...liveShares) : 0

  const movedPct = Math.round((model.moved / KEY_COUNT) * 100)
  const expectedPct =
    scheme === 'ring'
      ? Math.round(100 / nodeCount)
      : Math.round(((nodeCount - 1) / nodeCount) * 100)

  const failedName = NODE_NAMES[model.failed]

  const panelRows: PanelRow[] = [
    {
      label: 'placement scheme',
      value: scheme === 'ring' ? 'consistent ring' : 'hash % N',
    },
    {
      label: 'tokens per node',
      value: scheme === 'ring' ? String(perNode) : 'not applicable',
    },
    { label: 'expected share to move', value: `${expectedPct}%`, tone: 'muted' },
    {
      label: 'keys that changed owner',
      value: showAfter ? `${model.moved} of ${KEY_COUNT}` : '—',
      tone: showAfter ? (scheme === 'ring' ? 'success' : 'danger') : 'muted',
    },
    {
      label: 'measured share moved',
      value: showAfter ? `${movedPct}%` : '—',
      tone: showAfter ? (scheme === 'ring' ? 'success' : 'danger') : 'muted',
    },
    {
      label: 'load spread, live nodes',
      value: `${Math.round(spreadLow)}% – ${Math.round(spreadHigh)}%`,
      tone: spreadHigh - spreadLow > 18 ? 'danger' : 'default',
    },
  ]

  /** Indices of the rows worth the vertical budget on a phone. */
  const essentialRows = [0, 3, 4, 5]

  const narration =
    'Animated diagram comparing two ways of deciding which storage node owns a key. One hundred and sixty keys are hashed onto a circle that stands for the whole 32-bit keyspace, and each node claims a number of token positions on the same circle. Under consistent hashing a key belongs to the first node token clockwise from it, so every node owns a set of coloured arcs. The sequence removes one node and runs the assignment again; keys that changed hands are pushed out to a second orbit, and under consistent hashing only the keys inside the departed arcs move. A scheme control switches placement to hash modulo the node count, where ownership is a remainder rather than a position, so removing the same node reassigns almost every key and the outer orbit fills up. A tokens-per-node slider changes how finely each node is spread around the circle, and the bars on the right show that a single token per node leaves the load badly skewed while more tokens flatten it. The readout counts keys moved, the fraction expected for the chosen scheme, and the gap between the least and most loaded node.'

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
          const r = ringRadii(L.ring.radius)
          const ring = L.ring.at

          return (
            <>
              <VizLabel at={L.headings.keyspace} text="KEYSPACE · 0 → 2³² · CLOCKWISE" />
              <VizLabel at={L.headings.load} text="SHARE OF KEYS PER NODE" />

              <circle className="viz-ring-guide" cx={ring.x} cy={ring.y} r={r.bandInner} />
              <circle className="viz-ring-guide" cx={ring.x} cy={ring.y} r={r.bandOuter} />

              {/* Ownership arcs. A token owns everything back to the previous token. */}
              {scheme === 'ring' && (
                <g className="viz-ring-arcs">
                  {tokens.map((token, i) => {
                    const prev = tokens[(i - 1 + tokens.length) % tokens.length]!
                    return (
                      <VizArc
                        key={`${token.node}-${token.deg}`}
                        at={ring}
                        innerRadius={r.bandInner}
                        outerRadius={r.bandOuter}
                        startDeg={prev.deg}
                        endDeg={token.deg}
                        owner={token.node as Owner}
                        ghost={step === 1 && token.node === model.failed}
                      />
                    )
                  })}
                  {tokens.map((token) => (
                    <VizTick
                      key={`tick-${token.node}-${token.deg}`}
                      from={pointOnCircle(ring, r.tickInner, token.deg)}
                      to={pointOnCircle(ring, r.tickOuter, token.deg)}
                      owner={token.node as Owner}
                      tone={step === 1 && token.node === model.failed ? 'danger' : 'default'}
                    />
                  ))}
                </g>
              )}

              {/* One dot per key, at its hashed angle. */}
              <g className="viz-ring-keys">
                {KEY_ANGLES.map((deg, i) => {
                  const orphaned = step === 1 && model.before[i] === model.failed
                  const moved = showAfter && model.before[i] !== model.after[i]
                  const orbit = moved ? r.keyOrbitMoved : r.keyOrbit
                  // Dots track the ring: on a phone the whole figure is two
                  // thirds the size, and 3px dots at that scale merge into a
                  // solid band.
                  const scale = L.ring.radius / 242
                  return (
                    <VizDot
                      key={i}
                      at={pointOnCircle(ring, orbit, deg)}
                      radius={(orphaned ? 4.2 : 3) * Math.max(0.8, scale)}
                      owner={orphaned ? undefined : (owners[i] as Owner)}
                      tone={orphaned ? 'danger' : 'default'}
                      // On the departure step every surviving key recedes, so the
                      // orphans are the only thing left to look at.
                      ghost={step === 1 && !orphaned}
                      active={moved}
                    />
                  )
                })}
              </g>

              <VizLabel
                at={{ x: ring.x, y: ring.y - 6 }}
                text={scheme === 'ring' ? 'CONSISTENT HASHING' : 'HASH % N'}
              />
              <VizLabel
                at={{ x: ring.x, y: ring.y + 12 }}
                text={`${live.length} NODES · ${KEY_COUNT} KEYS`}
              />
              {step >= 2 && (
                <VizBadge
                  at={{ x: ring.x - 62, y: ring.y + 26 }}
                  width={124}
                  text={`${model.moved} keys moved`}
                  tone={scheme === 'ring' ? 'success' : 'danger'}
                />
              )}

              {/* Load per node. The failed node's bar drains to zero on reassignment. */}
              <g className="viz-ring-load">
                {model.liveBefore.map((n, i) => {
                  const gone = step >= 1 && n === model.failed
                  return (
                    <VizBar
                      key={n}
                      at={{ x: L.bars.x, y: L.bars.y + i * L.bars.step }}
                      width={L.bars.width}
                      height={10}
                      fraction={counts[n]! / KEY_COUNT}
                      owner={n as Owner}
                      ghost={gone}
                      label={gone ? `node ${NODE_NAMES[n]} · offline` : `node ${NODE_NAMES[n]}`}
                      value={`${counts[n]} keys · ${Math.round((counts[n]! / KEY_COUNT) * 100)}%`}
                    />
                  )
                })}
              </g>

              <VizPanel
                at={{ x: L.panel.x, y: L.panel.y }}
                width={L.panel.width}
                title={`IF NODE ${failedName} LEAVES`}
                rows={L.panelRows === 'full' ? panelRows : essentialRows.map((i) => panelRows[i]!)}
              />
            </>
          )
        }}
      </VizStage>

      <VizControls playback={playback} totalSteps={STEPS.length} phaseLabel={current.label}>
        <VizToggle
          label="Consistent ring"
          checked={scheme === 'ring'}
          onChange={() => {
            setScheme('ring')
            playback.reset()
          }}
          ariaLabel="Place keys with consistent hashing"
        />
        <VizToggle
          label="hash % N"
          tone="danger"
          checked={scheme === 'modulo'}
          onChange={() => {
            setScheme('modulo')
            playback.reset()
          }}
          ariaLabel="Place keys with hash modulo the node count"
        />
        <VizButton
          label="− node"
          disabled={nodeCount <= 3}
          ariaLabel="Remove a node from the cluster"
          onClick={() => {
            setNodeCount((n) => Math.max(3, n - 1))
            playback.reset()
          }}
        />
        <VizButton
          label="+ node"
          disabled={nodeCount >= NODE_NAMES.length}
          ariaLabel="Add a node to the cluster"
          onClick={() => {
            setNodeCount((n) => Math.min(NODE_NAMES.length, n + 1))
            playback.reset()
          }}
        />
        <VizSlider
          label="Tokens/node"
          value={perNode}
          min={1}
          max={32}
          disabled={scheme === 'modulo'}
          onChange={setPerNode}
        />
      </VizControls>
    </VizFigure>
  )
}
