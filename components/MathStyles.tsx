'use client'

// Importing the KaTeX stylesheet here (instead of in the blog post route layout)
// keeps it out of the route's static CSS graph. It is pulled in lazily via
// `next/dynamic` only for posts that actually render math, so the post route no
// longer ships — or prefetches — ~32KB of unused CSS on every article.
import 'katex/dist/katex.css'

export default function MathStyles() {
  return null
}
