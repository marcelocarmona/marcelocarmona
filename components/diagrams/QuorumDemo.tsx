import { useMemo, useState } from 'react'
import { VizStage, VizNode, VizEdge, VizBadge, VizLabel, VizPanel } from '../viz/primitives'
import type { EdgeRoute, PanelRow } from '../viz/primitives'
import { VizControls, VizFigure, VizSlider, VizStepCaption, VizToggle } from '../viz/controls'
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

/** Below this the client, coordinator and replicas stop fitting in one row. */
const STACK_BELOW = 700
/** Below this the readout no longer fits beside the fan-out, so it drops under it. */
const PANEL_BESIDE = 940

type Chip = { x: number; w: number; text: string; header: string }

type QuorumLayout = {
  width: number
  height: number
  stacked: boolean
  client: Box
  coord: Box
  replica: (index: number) => Box
  /** Fixed ports keep the fan-out legible at every replica count. */
  coordPort: (index: number) => Point
  replicaPort: (index: number) => Point
  /** How each direction of the fan-out is drawn at this width. */
  edgeRoute: { toReplica: EdgeRoute; toCoordinator: EdgeRoute }
  chips: Chip[]
  chipHeaderY: number
  chipY: (index: number) => number
  panel: { x: number; y: number; width: number }
  panelRows: 'full' | 'essential'
  resultBadge: { x: number; y: number; width: number }
  rule: Point
  /** Column headings are redundant once the boxes stack under each other. */
  headings: { client: Point; coord: Point; replicas: Point; overlap: Point | null } | null
}

const PANEL_ROW_COUNT = { full: 9, essential: 6 }
const panelHeight = (rows: number) => 40 + rows * 22

function buildLayout(width: number, n: number): QuorumLayout {
  if (width >= STACK_BELOW) {
    const margin = 24
    const chipWidths = [24, 24, 40]
    const chipSpan = chipWidths.reduce((a, b) => a + b, 0) + 12
    const beside = width >= PANEL_BESIDE

    // Dropped below the fan-out, the readout is centred and held to a width
    // where a label and its value still read as one row rather than as two
    // things at opposite ends of the screen.
    const panelWidth = beside
      ? clamp(Math.round(width * 0.28), 250, 300)
      : clamp(Math.round(width * 0.6), 380, 560)
    const chipsRight = beside ? width - margin - panelWidth - 16 : width - margin
    const chipsX = chipsRight - chipSpan
    const flowRight = chipsX - 12

    const clientW = 122
    const coordW = 164
    const replicaW = 146
    const boxes = clientW + coordW + replicaW
    const gap = clamp(Math.round((flowRight - margin - boxes) / 2), 24, 76)
    const flowLeft = margin + Math.max(0, Math.round((flowRight - margin - (boxes + gap * 2)) / 2))

    const clientX = flowLeft
    const coordX = clientX + clientW + gap
    const replicaX = coordX + coordW + gap

    const replicaH = 40
    const replicaStep = 50
    const bandTop = 46
    const bandHeight = Math.max(n * replicaStep - 10, 190)
    const bandBottom = bandTop + bandHeight
    const replicaTop = bandTop + (bandHeight - (n * replicaStep - 10)) / 2

    const clientH = 44
    const coordH = 56
    const panelY = beside ? bandTop : bandBottom + 52
    const panelX = beside ? width - margin - panelWidth : Math.round((width - panelWidth) / 2)
    const rows = PANEL_ROW_COUNT.full
    const ruleY = panelY + panelHeight(rows) + 26

    return {
      width,
      height: Math.max(bandBottom + 56, ruleY + 22),
      stacked: false,
      client: { x: clientX, y: bandTop + (bandHeight - clientH) / 2, w: clientW, h: clientH },
      coord: { x: coordX, y: bandTop + (bandHeight - coordH) / 2, w: coordW, h: coordH },
      replica: (i) => ({
        x: replicaX,
        y: replicaTop + i * replicaStep,
        w: replicaW,
        h: replicaH,
      }),
      coordPort: (i) => {
        const box = { x: coordX, y: bandTop + (bandHeight - coordH) / 2, h: coordH }
        const inset = 8
        const usable = box.h - inset * 2
        return {
          x: coordX + coordW + 3,
          y: n === 1 ? box.y + box.h / 2 : box.y + inset + (i * usable) / (n - 1),
        }
      },
      replicaPort: (i) => ({ x: replicaX - 3, y: replicaTop + i * replicaStep + replicaH / 2 }),
      edgeRoute: { toReplica: 'horizontal', toCoordinator: 'horizontal' },
      chips: [
        { x: chipsX, w: 24, text: 'W', header: 'W' },
        { x: chipsX + 30, w: 24, text: 'R', header: 'R' },
        { x: chipsX + 60, w: 40, text: 'both', header: 'BOTH' },
      ],
      chipHeaderY: 26,
      chipY: (i) => replicaTop + i * replicaStep + 11,
      panel: { x: panelX, y: panelY, width: panelWidth },
      panelRows: 'full',
      resultBadge: { x: coordX, y: bandBottom + 16, width: coordW },
      rule: { x: panelX + panelWidth / 2, y: ruleY },
      headings: {
        client: { x: clientX + clientW / 2, y: 26 },
        coord: { x: coordX + coordW / 2, y: 26 },
        replicas: { x: replicaX + replicaW / 2, y: 26 },
        // Only meaningful as a column heading. Once the readout drops below the
        // fan-out it would land on the result badge, and the rule spelled out
        // under the panel already says the same thing.
        overlap: beside ? { x: panelX + panelWidth / 2, y: 26 } : null,
      },
    }
  }

  // Stacked: the request flows down the page instead of across it, which is the
  // direction a phone has room in.
  const margin = 12
  const chipWidths = [22, 22, 36]
  const chipSpan = chipWidths.reduce((a, b) => a + b, 0) + 8

  /**
   * A gutter down the left for the fan-out to run in.
   *
   * With the replicas stacked, an edge aimed at the fifth one from the middle
   * of the coordinator would be drawn straight through the four above it. Every
   * port on both ends therefore sits left of the replica column, and the edges
   * turn a right angle rather than curving, so the whole fan is confined to
   * this gutter and never crosses a box.
   */
  const gutter = 56
  const replicaX = margin + gutter
  const replicaW = width - replicaX - chipSpan - margin - 8
  const chipsX = replicaX + replicaW + 8

  /**
   * One vertical lane per replica, so no two long segments ever share an x.
   *
   * The order is what keeps the fan free of crossings: the topmost replica gets
   * the lane nearest the column, so it turns off almost immediately, and each
   * lane below it runs further left. A lane only descends as far as its own
   * replica, so no horizontal turn ever meets a lane still in flight. The band
   * stops short of the column to leave room for the corner and the arrowhead.
   */
  const laneRight = replicaX - 26
  const laneLeft = margin + 2
  const lane = (i: number) =>
    n === 1 ? laneRight : laneRight - (i * (laneRight - laneLeft)) / (n - 1)

  const clientBox: Box = { x: margin, y: 6, w: width - margin * 2, h: 38 }
  const coordBox: Box = { x: margin, y: 80, w: width - margin * 2, h: 46 }

  const replicaH = 38
  const replicaStep = 46
  const replicaTop = 156
  const replicasBottom = replicaTop + n * replicaStep - (replicaStep - replicaH)

  const badgeWidth = Math.min(214, width - margin * 2)
  const badgeY = replicasBottom + 16
  const panelY = badgeY + 34
  const ruleY = panelY + panelHeight(PANEL_ROW_COUNT.essential) + 24

  return {
    width,
    height: ruleY + 18,
    stacked: true,
    client: clientBox,
    coord: coordBox,
    replica: (i) => ({ x: replicaX, y: replicaTop + i * replicaStep, w: replicaW, h: replicaH }),
    coordPort: (i) => ({ x: lane(i), y: coordBox.y + coordBox.h + 3 }),
    replicaPort: (i) => ({ x: replicaX - 3, y: replicaTop + i * replicaStep + replicaH / 2 }),
    // Leaving the coordinator, drop down the lane and turn into the replica.
    // Coming back, leave the replica sideways and turn up the lane. Either way
    // the arrowhead arrives square to the box it is pointing at.
    edgeRoute: { toReplica: 'elbow-v', toCoordinator: 'elbow-h' },
    chips: [
      { x: chipsX, w: 22, text: 'W', header: 'W' },
      { x: chipsX + 26, w: 22, text: 'R', header: 'R' },
      { x: chipsX + 52, w: 36, text: 'both', header: 'BOTH' },
    ],
    chipHeaderY: replicaTop - 8,
    chipY: (i) => replicaTop + i * replicaStep + 10,
    panel: { x: margin, y: panelY, width: width - margin * 2 },
    panelRows: 'essential',
    resultBadge: { x: (width - badgeWidth) / 2, y: badgeY, width: badgeWidth },
    rule: { x: width / 2, y: ruleY },
    headings: null,
  }
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

const STEP_LABELS = STEPS.map((s) => s.label)

export default function QuorumDemo() {
  const [nodes, setNodes] = useState(5)
  const [writeQuorum, setWriteQuorum] = useState(3)
  const [readQuorum, setReadQuorum] = useState(3)
  const [offline, setOffline] = useState(0)
  const [adversarial, setAdversarial] = useState(true)

  const playback = usePlayback(STEPS.length, 1600)
  const step = Math.min(playback.step, STEPS.length - 1)

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

  const panelRows: PanelRow[] = [
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
      value: showOverlap ? `${model.overlap} replica${model.overlap === 1 ? '' : 's'}` : '—',
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
  ]

  /** The six rows that still make the argument when there is no room for nine. */
  const essentialRows = [0, 1, 2, 3, 5, 8]

  return (
    <VizFigure
      onVisibilityChange={playback.setOnScreen}
      caption={<VizStepCaption steps={STEPS} step={step} />}
    >
      <VizStage layout={(width) => buildLayout(width, n)} narration={narration}>
        {(L) => (
          <>
            {L.headings && (
              <>
                <VizLabel at={L.headings.client} text="CLIENT" />
                <VizLabel at={L.headings.coord} text="COORDINATOR" />
                <VizLabel at={L.headings.replicas} text="REPLICAS" />
                {L.headings.overlap && <VizLabel at={L.headings.overlap} text="THE OVERLAP RULE" />}
              </>
            )}
            {L.chips.map((chip) => (
              <VizLabel
                key={chip.header}
                at={{ x: chip.x + chip.w / 2, y: L.chipHeaderY }}
                text={chip.header}
              />
            ))}

            {/* Static topology, dim, under whatever this step is doing. */}
            <g className="viz-graph-edges">
              {Array.from({ length: n }, (_, i) => (
                <VizEdge
                  key={`base-${i}`}
                  from={L.coord}
                  to={L.replica(i)}
                  fromPoint={L.coordPort(i)}
                  toPoint={L.replicaPort(i)}
                  route={L.edgeRoute.toReplica}
                  tone="muted"
                  variant="dashed"
                />
              ))}

              {/* Only the client edge carries a label. The coordinator sits close
               * enough to the replica column that a mid-edge label would land on
               * top of a box at every replica count. */}
              {step === 0 && (
                <VizEdge from={L.client} to={L.coord} tone="accent" label="PUT v2" active />
              )}

              {step === 1 &&
                model.online.map((i) => (
                  <VizEdge
                    key={`out-${i}`}
                    from={L.coord}
                    to={L.replica(i)}
                    fromPoint={L.coordPort(i)}
                    toPoint={L.replicaPort(i)}
                    route={L.edgeRoute.toReplica}
                    tone="accent"
                    active
                  />
                ))}

              {step === 2 &&
                model.writeSet.map((i) => (
                  <VizEdge
                    key={`ack-${i}`}
                    from={L.replica(i)}
                    to={L.coord}
                    fromPoint={L.replicaPort(i)}
                    toPoint={L.coordPort(i)}
                    route={L.edgeRoute.toCoordinator}
                    tone="success"
                    active
                  />
                ))}

              {step === 3 &&
                model.readSet.map((i) => (
                  <VizEdge
                    key={`get-${i}`}
                    from={L.coord}
                    to={L.replica(i)}
                    fromPoint={L.coordPort(i)}
                    toPoint={L.replicaPort(i)}
                    route={L.edgeRoute.toReplica}
                    tone="accent"
                    active
                  />
                ))}

              {step === 4 && (
                <>
                  {model.readSet.map((i) => (
                    <VizEdge
                      key={`ret-${i}`}
                      from={L.replica(i)}
                      to={L.coord}
                      fromPoint={L.replicaPort(i)}
                      toPoint={L.coordPort(i)}
                      route={L.edgeRoute.toCoordinator}
                      tone={model.result === 'fresh' ? 'success' : 'danger'}
                      active
                    />
                  ))}
                  <VizEdge
                    from={L.coord}
                    to={L.client}
                    tone={model.result === 'fresh' ? 'success' : 'danger'}
                    label={model.result === 'fresh' ? 'v2' : 'v1'}
                    active
                  />
                </>
              )}
            </g>

            <g className="viz-graph-nodes">
              <VizNode
                box={L.client}
                title="client"
                subtitle="one key, one value"
                tone="accent"
                active={step === 0 || step === 4}
              />
              <VizNode
                box={L.coord}
                title="coordinator"
                subtitle={`W = ${w} · R = ${r} of N = ${n}`}
                tone={model.result === 'fresh' ? 'success' : 'default'}
                active={step > 0}
              />

              {Array.from({ length: n }, (_, i) => {
                const dead = isDown(i)
                return (
                  <VizNode
                    key={`replica-${i}`}
                    box={L.replica(i)}
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
                const member = [
                  showWriteChips && model.inWrite.has(i),
                  showReadChips && model.readSet.includes(i),
                  showOverlap && model.inWrite.has(i) && model.readSet.includes(i),
                ]
                return (
                  <g key={`chips-${i}`}>
                    {L.chips.map((chip, c) => (
                      <VizBadge
                        key={chip.header}
                        at={{ x: chip.x, y: L.chipY(i) }}
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
              at={{ x: L.panel.x, y: L.panel.y }}
              width={L.panel.width}
              title="THIS CONFIGURATION"
              rows={L.panelRows === 'full' ? panelRows : essentialRows.map((i) => panelRows[i]!)}
            />

            <VizLabel at={L.rule} text="R + W > N  ⇒  THE TWO SETS MUST TOUCH" />

            {step >= 4 && (
              <VizBadge
                at={{ x: L.resultBadge.x, y: L.resultBadge.y }}
                width={L.resultBadge.width}
                text={resultText[model.result]}
                tone={model.result === 'fresh' ? 'success' : 'danger'}
              />
            )}
          </>
        )}
      </VizStage>

      <VizControls playback={playback} totalSteps={STEPS.length} phaseLabels={STEP_LABELS}>
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
