import { cn } from '@/lib/utils/cn'
import type { ElementType, HTMLAttributes, ReactNode } from 'react'

type TypographyProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  children?: ReactNode
}

export function DisplayTitle({ as: Component = 'div', className, ...props }: TypographyProps) {
  return <Component className={cn('font-display tracking-tight', className)} {...props} />
}

export function Eyebrow({ as: Component = 'p', className, ...props }: TypographyProps) {
  return (
    <Component
      className={cn(
        'text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300',
        className
      )}
      {...props}
    />
  )
}

export function MutedText({ as: Component = 'p', className, ...props }: TypographyProps) {
  return (
    <Component
      className={cn('text-muted-foreground dark:text-muted-foreground-dark', className)}
      {...props}
    />
  )
}

export function Prose({ as: Component = 'div', className, ...props }: TypographyProps) {
  return (
    <Component
      className={cn(
        'prose prose-neutral max-w-none dark:prose-invert',
        'prose-headings:font-bold prose-headings:tracking-tight prose-h3:font-semibold',
        'prose-a:text-primary-500 prose-a:transition-colors prose-a:hover:text-primary-600 dark:prose-a:hover:text-primary-400',
        'prose-pre:bg-gray-800',
        '[&_:where(code):not(:where(pre_code,.not-prose,.not-prose_*))]:rounded',
        '[&_:where(code):not(:where(pre_code,.not-prose,.not-prose_*))]:bg-gray-100',
        '[&_:where(code):not(:where(pre_code,.not-prose,.not-prose_*))]:px-1',
        '[&_:where(code):not(:where(pre_code,.not-prose,.not-prose_*))]:py-0.5',
        '[&_:where(code):not(:where(pre_code,.not-prose,.not-prose_*))]:text-pink-500',
        '[&_:where(a_code):not(:where(.not-prose,.not-prose_*))]:text-primary-400',
        '[&_:where(code):not(:where(.not-prose,.not-prose_*))]:before:content-none',
        '[&_:where(code):not(:where(.not-prose,.not-prose_*))]:after:content-none',
        '[&_ul_li::marker]:text-gray-500 dark:[&_ul_li::marker]:text-gray-400',
        'dark:[&_:where(code):not(:where(pre_code,.not-prose,.not-prose_*))]:bg-gray-800',
        className
      )}
      {...props}
    />
  )
}
