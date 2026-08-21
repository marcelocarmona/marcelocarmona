import { cn } from '@/lib/utils/cn'
import type { ElementType, HTMLAttributes, ReactNode } from 'react'

type TypographyProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  children?: ReactNode
}

export function DisplayTitle({ as: Component = 'div', className, ...props }: TypographyProps) {
  return <Component className={cn('font-display tracking-tight', className)} {...props} />
}

/** Small mono label above a title. Carries category, date, reading time. */
export function Eyebrow({ as: Component = 'p', className, ...props }: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

export function MutedText({ as: Component = 'p', className, ...props }: TypographyProps) {
  return <Component className={cn('text-muted-foreground', className)} {...props} />
}

type TypesetProps = TypographyProps & {
  /** `article` for long-form bodies, `note` for summaries and bios. */
  variant?: 'article' | 'note'
}

/**
 * Styles rendered markdown. Rhythm lives in css/typeset.css, driven by
 * --typeset-size / --typeset-leading / --typeset-flow.
 */
export function Typeset({
  as: Component = 'div',
  variant = 'article',
  className,
  ...props
}: TypesetProps) {
  return (
    <Component
      className={cn(
        'typeset',
        variant === 'article' ? 'typeset-article' : 'typeset-note',
        className
      )}
      {...props}
    />
  )
}
