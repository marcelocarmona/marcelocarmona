'use client'

import { useEffect, useMemo, useState } from 'react'
import type { TocHeading } from '@/types/content'

/**
 * Marginalia rail.
 *
 * Numbered section index for long articles. Lives in the left margin at xl and
 * above, where the page container is wider than the reading measure and the
 * space is otherwise empty. Below xl there is no margin to live in, so it
 * becomes a collapsed disclosure above the article instead.
 *
 * Only h2 headings are numbered: the rail answers "where am I in the argument",
 * which sub-headings dilute.
 */
export default function ArticleRail({ toc, label }: { toc: TocHeading[]; label: string }) {
  const sections = useMemo(() => toc.filter((heading) => heading.depth === 2), [toc])
  const [activeId, setActiveId] = useState<string>('')

  /*
   * Keyed on a string, not on `sections`. `toc` arrives as a fresh array on every
   * parent render, so an array dependency would tear down and rebuild the
   * observer each time. The joined ids are stable as long as the headings are.
   */
  const idKey = useMemo(
    () => sections.map((section) => section.url.replace('#', '')).join('|'),
    [sections]
  )

  useEffect(() => {
    if (!idKey) return

    const elements = idKey
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]) setActiveId(visible[0].target.id)
      },
      // Trigger as a heading reaches the upper third, so the mark moves with
      // reading position rather than with the very top of the viewport.
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [idKey])

  if (sections.length < 2) return null

  const list = (
    <ol className="space-y-2.5">
      {sections.map((section, index) => {
        const id = section.url.replace('#', '')
        const isActive = id === activeId

        return (
          <li key={section.url}>
            <a
              href={section.url}
              aria-current={isActive ? 'true' : undefined}
              className="group flex gap-2.5 text-sm leading-snug text-muted-foreground transition-colors duration-(--duration-ui) ease-(--ease-out-soft) hover:text-foreground aria-[current]:text-foreground"
            >
              {/*
                Full muted-foreground, not /70. At 11px the 70% tint measured
                3.24:1 in light and 4.00:1 in dark, both under AA.
              */}
              <span className="pt-px font-mono text-[0.6875rem] tabular-nums text-muted-foreground group-aria-[current]:text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-pretty">{section.value}</span>
            </a>
          </li>
        )
      })}
    </ol>
  )

  return (
    <>
      {/* Rail. Only where there is a margin wide enough to hold it. */}
      <nav
        aria-label={label}
        className="absolute left-0 top-0 hidden h-full w-44 xl:block"
        data-article-rail
      >
        <div className="sticky top-10 pr-6">
          <p className="mb-4 border-b border-border pb-2 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          {list}
        </div>
      </nav>

      {/* Below xl the same index collapses above the article. */}
      <details className="mx-auto mb-10 max-w-measure border-y border-border xl:hidden">
        <summary className="cursor-pointer py-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground marker:text-muted-foreground">
          {label}
        </summary>
        <div className="pb-4">{list}</div>
      </details>
    </>
  )
}
