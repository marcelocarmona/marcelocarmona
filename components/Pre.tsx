'use client'

import { useState, useRef } from 'react'
import type { HTMLAttributes } from 'react'

/**
 * Wraps rendered code blocks with a copy button.
 *
 * Props are forwarded to the `<pre>`. Shiki puts its `shiki` class and theme data
 * attributes there, so dropping them silently unstyles every code block.
 */
const Pre = ({ children, className, ...props }: HTMLAttributes<HTMLPreElement>) => {
  const textInput = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const onCopy = () => {
    setCopied(true)
    navigator.clipboard.writeText(textInput.current?.textContent || '')
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    // The button stays mounted and is revealed with opacity rather than being
    // conditionally rendered on hover. Mounting it only on mouseenter made it
    // unreachable by keyboard, so its focus-visible styles could never fire.
    <div ref={textInput} className="group relative">
      <button
        aria-label="Copy code"
        type="button"
        className="absolute right-3 top-3 size-8 rounded-md border border-code-border bg-code-surface p-1.5 text-[#a39d93] opacity-0 transition duration-(--duration-ui) ease-(--ease-out-soft) hover:text-[#ede9e1] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring group-hover:opacity-100 data-[copied=true]:text-primary"
        data-copied={copied}
        onClick={onCopy}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill="none"
        >
          {copied ? (
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </>
          ) : (
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </>
          )}
        </svg>
      </button>

      <pre className={className} {...props}>
        {children}
      </pre>
    </div>
  )
}

export default Pre
