import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

/**
 * Responsive strategy for every diagram on this site.
 *
 * The naive approach — author one 1040px canvas and let `viewBox` scale it down
 * — fails on a phone. A 10px label inside a 1040-wide canvas rendered into a
 * 360px column comes out at 3.5px, and the reader is left pinching or scrolling
 * sideways through a picture that was supposed to explain something.
 *
 * So diagrams here are not scaled, they are *reflowed*. Each one exports a pure
 * function from the width the figure actually has, in CSS pixels, to a layout:
 * positions, radii, column counts, how many readout rows are worth showing. The
 * stage measures itself and sets `viewBox` to that same width, so one SVG user
 * unit is always one CSS pixel and every label renders at the size it was
 * authored at, on a 4K monitor and on a phone alike.
 *
 * The tradeoff is that a diagram cannot hardcode coordinates. That is the
 * point: a diagram that cannot describe its own layout at 360px does not have
 * a mobile layout, it has a desktop layout and a hope.
 */

/**
 * Shared reflow thresholds, in CSS pixels of available figure width.
 *
 * These are properties of the content, not of any device. `compact` is roughly
 * "one column of boxes plus a readout fits side by side"; `wide` is "a diagram
 * and its readout panel fit side by side with room to breathe". Diagrams are
 * free to pick their own numbers when their content demands it — a hash ring
 * needs a square of space that a bar chart does not.
 */
export const VIZ_BREAKPOINT = {
  /** Below this, stack everything in a single column. */
  compact: 700,
  /** At or above this, a full two-column desktop layout fits. */
  wide: 940,
} as const

export type VizDensity = 'compact' | 'medium' | 'wide'

export function densityFor(width: number): VizDensity {
  if (width >= VIZ_BREAKPOINT.wide) return 'wide'
  if (width >= VIZ_BREAKPOINT.compact) return 'medium'
  return 'compact'
}

/** Every layout carries the canvas it wants; the stage reads nothing else. */
export type StageLayout = { width: number; height: number }

/**
 * Widths are snapped to this grid before they reach React.
 *
 * Dragging a window edge fires a `ResizeObserver` callback per pixel. Snapping
 * turns three hundred re-renders of a three-thousand-trial simulation into
 * about forty, and no layout in this codebase is sensitive to eight pixels.
 */
const GRID = 8

/** Narrower than any phone in use; below this the page has bigger problems. */
const MIN_WIDTH = 280

function snap(width: number): number {
  return Math.max(MIN_WIDTH, Math.round(width / GRID) * GRID)
}

/**
 * `useLayoutEffect` warns when React renders on the server, and this component
 * tree is server-rendered before it hydrates. Running the measurement in a
 * layout effect on the client is what keeps the correct layout from flashing:
 * it commits before the browser paints, so the reader never sees the
 * server's assumed width.
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * The width available to a diagram, measured from the DOM.
 *
 * Returns a callback ref to attach to the element that defines that width.
 * Until it is attached — on the server, and for the first client render —
 * `fallback` is used, so server and client markup agree and hydration stays
 * quiet.
 */
export function useStageWidth(fallback: number): {
  ref: (node: HTMLElement | null) => void
  width: number
} {
  const [width, setWidth] = useState(() => snap(fallback))
  const [element, setElement] = useState<HTMLElement | null>(null)

  const ref = useCallback((node: HTMLElement | null) => setElement(node), [])

  useIsomorphicLayoutEffect(() => {
    if (!element) return

    const measure = () => {
      // `clientWidth` excludes any scrollbar the element itself shows, which is
      // the width the drawing genuinely gets.
      const next = snap(element.clientWidth)
      setWidth((current) => (current === next ? current : next))
    }

    measure()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  return { ref, width }
}

/** Round-trip helper for layout maths that must not produce fractional pixels. */
export function px(n: number): number {
  return Math.round(n)
}
