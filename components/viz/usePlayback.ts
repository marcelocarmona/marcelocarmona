import { useCallback, useEffect, useState } from 'react'

/**
 * Discrete-step playback driver shared by every diagram.
 *
 * The contract that keeps diagrams maintainable: `step` is the only source of
 * truth, and layout is a pure function of it. Nothing here touches the DOM, so
 * there is no imperative animation code to keep in sync.
 */

export type Playback = {
  step: number
  playing: boolean
  speed: number
  setStep: (n: number) => void
  next: () => void
  prev: () => void
  reset: () => void
  toggle: () => void
  setSpeed: (n: number) => void
  /**
   * Told by `VizFigure` whether the diagram is on screen. While it is not, the
   * clock stops, so a reader scrolling down a long article arrives at step one
   * instead of at whatever step the diagram reached while nobody was looking.
   * On a phone, where every figure is off screen most of the time, this is also
   * the difference between one running timer and six.
   */
  setOnScreen: (visible: boolean) => void
}

export function usePlayback(totalSteps: number, intervalMs = 900): Playback {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [onScreen, setOnScreen] = useState(true)

  // Respect the OS-level reduced-motion setting: never autoplay.
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) setPlaying(false)
  }, [reduced])

  useEffect(() => {
    if (!playing || !onScreen || totalSteps <= 0) return
    const id = window.setInterval(
      () => setStep((s) => (s + 1) % totalSteps),
      Math.max(80, intervalMs / speed)
    )
    return () => window.clearInterval(id)
  }, [playing, onScreen, speed, intervalMs, totalSteps])

  const next = useCallback(() => {
    setPlaying(false)
    setStep((s) => (s + 1) % totalSteps)
  }, [totalSteps])

  const prev = useCallback(() => {
    setPlaying(false)
    setStep((s) => (s - 1 + totalSteps) % totalSteps)
  }, [totalSteps])

  const reset = useCallback(() => {
    setPlaying(false)
    setStep(0)
  }, [])

  const toggle = useCallback(() => setPlaying((p) => !p), [])

  return { step, playing, speed, setStep, next, prev, reset, toggle, setSpeed, setOnScreen }
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
