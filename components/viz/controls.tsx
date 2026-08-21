import { useCallback, type ReactNode } from 'react'
import type { Playback } from './usePlayback'

/**
 * Keyboard-operable transport controls shared by every diagram.
 *
 * Real <button> elements, not divs, so tab/enter/space work for free. Sizing
 * lives in `viz.css`, which grows every hit target past the 44px thumb target
 * under `pointer: coarse` without changing anything here.
 */

type ControlsProps = {
  playback: Playback
  totalSteps: number
  /** Short label for the current step, shown next to the transport buttons. */
  phaseLabel?: string
  /** Diagram-specific controls (toggles, sliders) rendered on the right. */
  children?: ReactNode
}

export function VizControls({ playback, totalSteps, phaseLabel, children }: ControlsProps) {
  const { step, playing, speed, toggle, next, prev, reset, setSpeed } = playback

  return (
    <div className="viz-controls">
      <div className="viz-controls-transport">
        <button type="button" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? '❙❙' : '▶'}
        </button>
        <button type="button" onClick={prev} aria-label="Previous step">
          ‹
        </button>
        <button type="button" onClick={next} aria-label="Next step">
          ›
        </button>
        <button type="button" onClick={reset} aria-label="Reset to first step">
          ↺
        </button>

        <span className="viz-step-readout">
          {phaseLabel ? `${phaseLabel} · ` : ''}
          {step + 1}/{totalSteps}
        </span>

        <label className="viz-slider viz-slider-speed">
          <span>Speed</span>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.5}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            aria-label="Playback speed"
          />
          <span className="viz-slider-value">{speed}×</span>
        </label>
      </div>

      {children && <div className="viz-controls-custom">{children}</div>}
    </div>
  )
}

/** A labelled on/off switch, e.g. for taking a node offline. */
export function VizToggle({
  label,
  checked,
  onChange,
  ariaLabel,
  tone,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  ariaLabel?: string
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      className="viz-toggle"
      data-checked={checked ? '' : undefined}
      data-tone={tone ?? 'default'}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      aria-label={ariaLabel ?? label}
    >
      <span className="viz-toggle-dot" />
      {label}
    </button>
  )
}

/** A plain action button, for discrete changes that aren't a state toggle. */
export function VizButton({
  label,
  onClick,
  ariaLabel,
  disabled,
}: {
  label: string
  onClick: () => void
  ariaLabel?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      className="viz-button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
    >
      {label}
    </button>
  )
}

/** A labelled range input for reader-controllable simulation parameters. */
export function VizSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <label className="viz-slider" data-disabled={disabled ? '' : undefined}>
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        aria-label={label}
      />
      <span className="viz-slider-value">
        {value}
        {unit ?? ''}
      </span>
    </label>
  )
}

/** Standard chrome around a diagram: stage, controls, and a caption. */
export function VizFigure({
  children,
  caption,
  className,
  onVisibilityChange,
}: {
  children: ReactNode
  caption?: ReactNode
  className?: string
  /**
   * Called when the figure enters or leaves the viewport. Pass
   * `playback.setOnScreen` to stop the clock while nobody is watching.
   */
  onVisibilityChange?: (visible: boolean) => void
}) {
  const attach = useCallback(
    (node: HTMLElement | null) => {
      if (!node || !onVisibilityChange || typeof IntersectionObserver === 'undefined') return
      const observer = new IntersectionObserver(
        ([entry]) => onVisibilityChange(entry?.isIntersecting ?? true),
        // Any sliver counts as watched: a stacked diagram on a phone may never
        // be more than half visible.
        { threshold: 0 }
      )
      observer.observe(node)
      return () => observer.disconnect()
    },
    [onVisibilityChange]
  )

  return (
    <figure ref={attach} className={`not-prose viz-figure${className ? ` ${className}` : ''}`}>
      {children}
      {caption && <figcaption className="viz-caption">{caption}</figcaption>}
    </figure>
  )
}
