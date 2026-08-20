import type { ReactNode } from 'react'
import {
  anchorOnBox,
  angleDeg,
  arcBandPath,
  center,
  clamp,
  curveControlPoint,
  curvePath,
  r2,
  type Box,
  type Point,
} from './geometry'

/**
 * Presentational SVG primitives shared by every diagram.
 *
 * These own layout only. Appearance is driven by CSS keyed off `data-tone` and
 * `data-variant` attributes, so a diagram component never contains color logic
 * and theming stays in one stylesheet.
 */

export type Tone = 'default' | 'accent' | 'success' | 'danger' | 'muted'

/**
 * Index into the categorical palette in `viz.css`, for when a diagram needs to
 * distinguish several peers of equal status — five storage nodes, say. `tone`
 * still carries meaning (good, bad, inactive); `owner` carries identity.
 */
export type Owner = 0 | 1 | 2 | 3 | 4 | 5

type StageProps = {
  /** Coordinate space to author in. Content is scaled to fit any screen. */
  width: number
  height: number
  /**
   * Full prose narration of what the diagram shows and teaches.
   *
   * Write this before writing the diagram. If it cannot be narrated clearly,
   * the diagram is not yet clear.
   */
  narration: string
  children: ReactNode
}

export function VizStage({ width, height, narration, children }: StageProps) {
  return (
    <div
      className="viz-stage-scroll"
      role="region"
      aria-label="Scrollable diagram canvas"
      tabIndex={0}
    >
      <svg
        className="viz-stage"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={narration}
        preserveAspectRatio="xMidYMid meet"
      >
        {children}
      </svg>
    </div>
  )
}

type NodeProps = {
  box: Box
  title: string
  subtitle?: string
  tone?: Tone
  /** Dimmed + dashed, for objects not yet fetched or nodes that are offline. */
  ghost?: boolean
  /** Emphasised, for the element currently being acted on. */
  active?: boolean
}

export function VizNode({ box, title, subtitle, tone = 'default', ghost, active }: NodeProps) {
  return (
    <g
      className="viz-node-group"
      transform={`translate(${box.x} ${box.y})`}
      data-tone={tone}
      data-ghost={ghost ? '' : undefined}
      data-active={active ? '' : undefined}
    >
      <rect className="viz-node" width={box.w} height={box.h} rx={4} />
      <text
        className="viz-node-title"
        x={box.w / 2}
        y={subtitle ? box.h / 2 - 7 : box.h / 2}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {title}
      </text>
      {subtitle && (
        <text
          className="viz-node-subtitle"
          x={box.w / 2}
          y={box.h / 2 + 8}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {subtitle}
        </text>
      )}
    </g>
  )
}

type EdgeProps = {
  from: Box
  to: Box
  /** Fixed connection points, for diagrams whose edges need stable ports. */
  fromPoint?: Point
  toPoint?: Point
  /** Enter and leave nodes horizontally with a smooth, ordered curve. */
  route?: 'direct' | 'horizontal'
  variant?: 'solid' | 'dashed'
  tone?: Tone
  label?: string
  /** Curve the edge perpendicular to its line, to separate overlapping pairs. */
  bow?: number
  active?: boolean
}

export function VizEdge({
  from,
  to,
  fromPoint,
  toPoint,
  route = 'direct',
  variant = 'solid',
  tone = 'default',
  label,
  bow = 0,
  active,
}: EdgeProps) {
  // Trim each end to the box perimeter so arrowheads never overlap the nodes.
  const a = fromPoint ?? anchorOnBox(from, center(to))
  const b = toPoint ?? anchorOnBox(to, center(from))

  let arrowTangent = bow === 0 ? a : curveControlPoint(a, b, bow)

  if (route === 'horizontal') {
    arrowTangent = { x: a.x, y: b.y }
  }

  // The arrow follows the final segment of the path. Using the end-to-end
  // angle here makes arrowheads visibly detach from curved connectors.
  const rot = angleDeg(arrowTangent, b)
  const radians = (rot * Math.PI) / 180
  // Stop the connector at the arrowhead's base instead of drawing through it.
  // A small overlap prevents a hairline seam without changing its silhouette.
  const pathEnd = {
    x: b.x - Math.cos(radians) * 8.5,
    y: b.y - Math.sin(radians) * 8.5,
  }

  let path: string
  if (route === 'horizontal') {
    const midX = (a.x + pathEnd.x) / 2
    path = `M ${a.x} ${a.y} C ${midX} ${a.y} ${midX} ${pathEnd.y} ${pathEnd.x} ${pathEnd.y}`
  } else if (bow !== 0) {
    const control = curveControlPoint(a, b, bow)
    path = `M ${a.x} ${a.y} Q ${control.x} ${control.y} ${pathEnd.x} ${pathEnd.y}`
  } else {
    path = curvePath(a, pathEnd)
  }

  return (
    <g className="viz-edge-group" data-tone={tone} data-active={active ? '' : undefined}>
      <path className="viz-edge" data-variant={variant} d={path} />
      <path
        className="viz-edge-arrow"
        d="M 0 0 L -9 -4 L -9 4 Z"
        transform={`translate(${b.x} ${b.y}) rotate(${rot})`}
      />
      {label && (
        <text
          className="viz-edge-label"
          x={(a.x + b.x) / 2}
          y={(a.y + b.y) / 2 - 6}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}

type BadgeProps = {
  at: Point
  text: string
  tone?: Tone
  width?: number
  /** Outline only, for a slot in a set that the current run did not fill. */
  ghost?: boolean
}

export function VizBadge({ at, text, tone = 'default', width, ghost }: BadgeProps) {
  const w = width ?? Math.max(34, text.length * 6.6 + 14)
  return (
    <g
      className="viz-badge"
      data-tone={tone}
      data-ghost={ghost ? '' : undefined}
      transform={`translate(${at.x} ${at.y})`}
    >
      <rect width={w} height={18} rx={3} />
      <text x={w / 2} y={9} textAnchor="middle" dominantBaseline="central">
        {text}
      </text>
    </g>
  )
}

export function VizLabel({
  at,
  text,
  anchor = 'middle',
}: {
  at: Point
  text: string
  anchor?: 'start' | 'middle' | 'end'
}) {
  return (
    <text className="viz-label" x={at.x} y={at.y} textAnchor={anchor}>
      {text}
    </text>
  )
}

/** A moving packet travelling along an edge, positioned by the caller. */
export function VizPacket({
  at,
  tone = 'accent',
  label,
}: {
  at: Point
  tone?: Tone
  label?: string
}) {
  return (
    <g className="viz-packet" data-tone={tone} transform={`translate(${at.x} ${at.y})`}>
      <circle r={5} />
      {label && (
        <text className="viz-packet-label" y={-10} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  )
}

type DotProps = {
  at: Point
  radius?: number
  tone?: Tone
  owner?: Owner
  ghost?: boolean
  /** Ringed, for an item that changed hands since the previous step. */
  active?: boolean
  label?: string
}

/** A single datum: one key on a hash ring, one percentile on a scale. */
export function VizDot({
  at,
  radius = 4.5,
  tone = 'default',
  owner,
  ghost,
  active,
  label,
}: DotProps) {
  return (
    <g
      className="viz-dot"
      data-tone={tone}
      data-owner={owner}
      data-ghost={ghost ? '' : undefined}
      data-active={active ? '' : undefined}
      transform={`translate(${at.x} ${at.y})`}
    >
      {active && <circle className="viz-dot-halo" r={radius + 4} />}
      <circle className="viz-dot-core" r={radius} />
      {label && (
        <text className="viz-dot-label" y={-radius - 7} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  )
}

type BarProps = {
  at: Point
  width: number
  height: number
  /** 0–1. Values outside the range are clamped rather than overflowing. */
  fraction: number
  tone?: Tone
  owner?: Owner
  ghost?: boolean
  /** Drawn above the left end of the track. */
  label?: string
  /** Drawn above the right end of the track. */
  value?: string
}

export function VizBar({
  at,
  width,
  height,
  fraction,
  tone = 'default',
  owner,
  ghost,
  label,
  value,
}: BarProps) {
  const filled = r2(clamp(fraction, 0, 1) * width)
  return (
    <g
      className="viz-bar"
      data-tone={tone}
      data-owner={owner}
      data-ghost={ghost ? '' : undefined}
      transform={`translate(${at.x} ${at.y})`}
    >
      <rect className="viz-bar-track" width={width} height={height} rx={2} />
      <rect className="viz-bar-fill" width={filled} height={height} rx={2} />
      {label && (
        <text className="viz-bar-label" x={0} y={-6}>
          {label}
        </text>
      )}
      {value && (
        <text className="viz-bar-value" x={width} y={-6} textAnchor="end">
          {value}
        </text>
      )}
    </g>
  )
}

/** A straight rule: a hash-ring token marker, an axis tick, a fan-out stub. */
export function VizTick({
  from,
  to,
  tone = 'default',
  owner,
  variant = 'solid',
}: {
  from: Point
  to: Point
  tone?: Tone
  owner?: Owner
  variant?: 'solid' | 'dashed'
}) {
  return (
    <line
      className="viz-tick"
      data-tone={tone}
      data-owner={owner}
      data-variant={variant}
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
    />
  )
}

/** One node's slice of a hash ring. */
export function VizArc({
  at,
  innerRadius,
  outerRadius,
  startDeg,
  endDeg,
  owner,
  tone = 'default',
  ghost,
}: {
  at: Point
  innerRadius: number
  outerRadius: number
  startDeg: number
  endDeg: number
  owner?: Owner
  tone?: Tone
  ghost?: boolean
}) {
  return (
    <path
      className="viz-arc"
      data-tone={tone}
      data-owner={owner}
      data-ghost={ghost ? '' : undefined}
      d={arcBandPath(at, innerRadius, outerRadius, startDeg, endDeg)}
    />
  )
}

export type PanelRow = { label: string; value: string; tone?: Tone }

/**
 * A readout of the numbers the simulation just produced.
 *
 * Every value here is computed from the same state that drew the picture, so
 * the diagram cannot claim one thing visually and another numerically.
 */
export function VizPanel({
  at,
  width,
  title,
  rows,
}: {
  at: Point
  width: number
  title: string
  rows: PanelRow[]
}) {
  const rowHeight = 22
  const height = 40 + rows.length * rowHeight
  return (
    <g className="viz-panel" transform={`translate(${at.x} ${at.y})`}>
      <rect className="viz-panel-frame" width={width} height={height} rx={5} />
      <text className="viz-panel-title" x={12} y={19}>
        {title}
      </text>
      <line className="viz-panel-rule" x1={0} y1={28} x2={width} y2={28} />
      {rows.map((row, i) => (
        <g
          key={row.label}
          data-tone={row.tone ?? 'default'}
          transform={`translate(0 ${46 + i * rowHeight})`}
        >
          <text className="viz-panel-label" x={12} y={0}>
            {row.label}
          </text>
          <text className="viz-panel-value" x={width - 12} y={0} textAnchor="end">
            {row.value}
          </text>
        </g>
      ))}
    </g>
  )
}
