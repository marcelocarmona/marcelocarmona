/**
 * Geometry helpers for SVG diagrams.
 *
 * Everything here is pure. Diagram components compute layout from a `step`
 * value and hand the result to the presentational primitives — no imperative
 * animation code anywhere in this codebase.
 */

export type Point = { x: number; y: number }

export type Box = Point & { w: number; h: number }

/** Center point of a box. */
export function center(b: Box): Point {
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 }
}

/**
 * Where a line aimed at `to` exits the perimeter of box `b`.
 *
 * Without this, edges visually tunnel under the node rectangles. Solving for
 * the box edge keeps arrowheads sitting flush against the border regardless of
 * the angle between the two nodes.
 */
export function anchorOnBox(b: Box, to: Point): Point {
  const c = center(b)
  const dx = to.x - c.x
  const dy = to.y - c.y
  if (dx === 0 && dy === 0) return c

  const halfW = b.w / 2
  const halfH = b.h / 2
  // Scale the direction vector until it touches whichever edge it reaches first.
  const scale = Math.min(
    dx === 0 ? Infinity : halfW / Math.abs(dx),
    dy === 0 ? Infinity : halfH / Math.abs(dy)
  )
  return { x: c.x + dx * scale, y: c.y + dy * scale }
}

/** Angle of the vector a→b in degrees, for rotating arrowheads. */
export function angleDeg(a: Point, b: Point): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
}

/**
 * Rounds to two decimals before a number reaches the DOM.
 *
 * `Math.cos` and friends are allowed to differ by one unit in the last place
 * between JavaScript engines, and this site renders on Node and hydrates in the
 * browser. Rounding the coordinates makes both sides emit the same path string,
 * so React never reports a hydration mismatch.
 */
export function r2(n: number): number {
  return Math.round(n * 100) / 100
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

/** Linear interpolation between two points, `t` in [0, 1]. */
export function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/**
 * Cubic bezier path between two points, bowed perpendicular to the line.
 *
 * Used when two edges connect the same pair of nodes in opposite directions
 * and would otherwise overlap exactly.
 */
export function curvePath(a: Point, b: Point, bow = 0): string {
  if (bow === 0) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`
  const control = curveControlPoint(a, b, bow)
  return `M ${a.x} ${a.y} Q ${control.x} ${control.y} ${b.x} ${b.y}`
}

/** Control point for `curvePath`, also used to align its arrowhead tangent. */
export function curveControlPoint(a: Point, b: Point, bow: number): Point {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  // Perpendicular unit vector, scaled by the bow amount.
  const nx = -dy / len
  const ny = dx / len
  return { x: mx + nx * bow, y: my + ny * bow }
}

/**
 * Point on a circle, with 0° at twelve o'clock and angles increasing clockwise.
 *
 * That orientation is not arbitrary. Hash rings are drawn this way by
 * convention, and a key is owned by the first node token clockwise from it, so
 * "clockwise" has to mean the same thing in the geometry and in the prose.
 */
export function pointOnCircle(c: Point, radius: number, deg: number): Point {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: r2(c.x + radius * Math.cos(rad)), y: r2(c.y + radius * Math.sin(rad)) }
}

/** Filled band between two radii, swept clockwise from `startDeg` to `endDeg`. */
export function arcBandPath(
  c: Point,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number
): string {
  // A 360° sweep has identical start and end points, which SVG renders as
  // nothing at all. Leaving a hairline gap is the standard way out.
  const sweep = clamp((((endDeg - startDeg) % 360) + 360) % 360, 0.01, 359.99)
  const end = startDeg + sweep
  const large = sweep > 180 ? 1 : 0
  const o0 = pointOnCircle(c, rOuter, startDeg)
  const o1 = pointOnCircle(c, rOuter, end)
  const i1 = pointOnCircle(c, rInner, end)
  const i0 = pointOnCircle(c, rInner, startDeg)
  return [
    `M ${o0.x} ${o0.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${o1.x} ${o1.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${i0.x} ${i0.y}`,
    'Z',
  ].join(' ')
}

/**
 * FNV-1a, 32 bits, with murmur3's finaliser mixed in.
 *
 * The finaliser is not optional here. Plain FNV-1a avalanches poorly in its
 * high bits for short inputs, and a hash ring reads exactly those bits when it
 * turns a hash into an angle. Without the extra mixing, `A#0` through `F#7`
 * land in clumps and two of six nodes end up owning nothing at all, which
 * would make the diagram teach something false.
 *
 * Integer operations only, so every engine produces the same number and a
 * server-rendered ring lands on exactly the same angles after hydration.
 */
export function hash32(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}

/** A 32-bit hash mapped onto the circle, in degrees. */
export function hashAngle(s: string): number {
  return (hash32(s) / 4294967296) * 360
}

/**
 * mulberry32. Seeded, and integer-only for the same reason as `hash32`.
 *
 * Diagrams that simulate load must never call `Math.random`: the server and the
 * browser would disagree about what the reader is looking at.
 */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Nearest-rank percentile of an ascending-sorted array. */
export function percentile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0
  const idx = clamp(Math.ceil(q * sorted.length) - 1, 0, sorted.length - 1)
  return sorted[idx]!
}
