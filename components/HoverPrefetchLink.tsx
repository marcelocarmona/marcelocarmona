'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { AnchorHTMLAttributes } from 'react'

type HoverPrefetchLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
}

/**
 * A `next/link` that defers prefetching until the user shows intent.
 *
 * By default Next.js prefetches every link that scrolls into the viewport. On
 * pages that render a long list of article links that means downloading each
 * route's RSC payload and CSS chunk for navigations that mostly never happen,
 * which also trips Chrome's "preloaded but not used" console warning.
 *
 * `prefetch={false}` until hover/touch, then `null` to restore the default
 * behaviour — the pattern documented in the Next.js prefetching guide.
 */
export default function HoverPrefetchLink({ href, ...rest }: HoverPrefetchLinkProps) {
  const [active, setActive] = useState(false)
  const activate = () => setActive(true)

  return (
    <Link
      href={href}
      prefetch={active ? null : false}
      onMouseEnter={activate}
      onFocus={activate}
      onTouchStart={activate}
      {...rest}
    />
  )
}
