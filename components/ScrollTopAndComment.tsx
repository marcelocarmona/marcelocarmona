'use client'

import siteMetadata from '@/data/siteMetadata'
import { useEffect, useState } from 'react'
import { getUiCopy } from '@/lib/i18n/ui'
import type { LocaleInput } from '@/types/content'

const controlClassName =
  'rounded-full bg-muted p-2 text-muted-foreground transition-all hover:bg-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-foreground dark:hover:bg-foreground'

const ScrollTopAndComment = ({
  locale = 'en',
  markdownPath,
}: {
  locale?: LocaleInput
  markdownPath: string
}) => {
  const [show, setShow] = useState(false)
  const { scroll } = getUiCopy(locale)

  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollY > 50) setShow(true)
      else setShow(false)
    }

    window.addEventListener('scroll', handleWindowScroll)
    return () => window.removeEventListener('scroll', handleWindowScroll)
  }, [])

  const handleScrollTop = () => {
    window.scrollTo({ top: 0 })
  }
  const handleScrollToComment = () => {
    document.getElementById('comment')?.scrollIntoView()
  }
  return (
    <div
      className={`fixed bottom-8 right-8 z-40 hidden flex-col gap-3 ${show ? 'md:flex' : 'md:hidden'}`}
    >
      <a
        aria-label={scroll.viewAsMarkdown}
        href={markdownPath}
        rel="alternate"
        title={scroll.viewAsMarkdown}
        type="text/markdown"
        className={controlClassName}
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        >
          <path d="M5.25 2.75h6l3.5 3.5v11H5.25z" />
          <path d="M11.25 2.75v3.5h3.5M7.75 10h4.5M7.75 13h4.5" />
        </svg>
      </a>
      {siteMetadata.comment.provider && (
        <button
          aria-label={scroll.toComment}
          type="button"
          onClick={handleScrollToComment}
          className={controlClassName}
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
      <button
        aria-label={scroll.toTop}
        type="button"
        onClick={handleScrollTop}
        className={controlClassName}
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}

export default ScrollTopAndComment
