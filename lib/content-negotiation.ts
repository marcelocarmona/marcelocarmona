/**
 * HTTP content negotiation helpers for the acceptmarkdown.com convention.
 *
 * Kept dependency free so it can run in the middleware (Edge) runtime.
 * Reference: RFC 9110 section 12.5.1 and https://acceptmarkdown.com/recipes/nextjs
 */

export const PRODUCED_TYPES = ['text/html', 'text/markdown'] as const

export type ProducedType = (typeof PRODUCED_TYPES)[number]

export const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8'

interface AcceptEntry {
  type: string
  q: number
  specificity: number
}

function parseQuality(rawValue: string | undefined): number {
  const parsed = Number(rawValue)
  if (Number.isNaN(parsed)) {
    return 1
  }

  return Math.max(0, Math.min(1, parsed))
}

export function parseAcceptHeader(header: string): AcceptEntry[] {
  return header
    .split(',')
    .map((rawEntry) => rawEntry.trim())
    .filter(Boolean)
    .map((rawEntry) => {
      const [rawType, ...rawParams] = rawEntry.split(';').map((part) => part.trim())
      const type = rawType.toLowerCase()
      let q = 1

      rawParams.forEach((param) => {
        const [name, value] = param.split('=').map((part) => part.trim())
        if (name?.toLowerCase() === 'q') {
          q = parseQuality(value)
        }
      })

      const specificity = type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2

      return { type, q, specificity }
    })
}

function matchesCandidate(entry: AcceptEntry, candidate: string): boolean {
  if (entry.type === '*/*') {
    return true
  }

  if (entry.type.endsWith('/*')) {
    return candidate.startsWith(entry.type.slice(0, -1))
  }

  return entry.type === candidate
}

/**
 * Picks the representation to serve for an Accept header.
 *
 * Returns `null` when the client explicitly rejects everything we can produce,
 * which is the only case where a 406 is correct.
 */
export function preferredType(header: string | null | undefined): ProducedType | null {
  if (!header) {
    return PRODUCED_TYPES[0]
  }

  const entries = parseAcceptHeader(header)
  if (entries.length === 0) {
    return PRODUCED_TYPES[0]
  }

  let bestType: ProducedType | null = null
  let bestQuality = -1
  let bestPosition = Number.POSITIVE_INFINITY

  PRODUCED_TYPES.forEach((candidate) => {
    // A more specific range always wins over a less specific one, regardless of q,
    // so `text/html;q=0, */*` correctly rejects HTML instead of resurrecting it.
    let matched: AcceptEntry | null = null
    let matchedPosition = Number.POSITIVE_INFINITY

    entries.forEach((entry, index) => {
      if (!matchesCandidate(entry, candidate)) {
        return
      }

      if (
        matched === null ||
        entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity && index < matchedPosition)
      ) {
        matched = entry
        matchedPosition = index
      }
    })

    if (matched === null) {
      return
    }

    const matchedQuality = (matched as AcceptEntry).q
    if (matchedQuality <= 0) {
      return
    }

    // Across candidates: highest q wins, ties broken by client order so
    // `Accept: text/markdown, text/html` picks Markdown.
    if (
      matchedQuality > bestQuality ||
      (matchedQuality === bestQuality && matchedPosition < bestPosition)
    ) {
      bestQuality = matchedQuality
      bestPosition = matchedPosition
      bestType = candidate
    }
  })

  return bestType
}

export function appendVaryAccept(headers: Headers): void {
  const existing = headers.get('Vary')

  if (!existing) {
    headers.set('Vary', 'Accept')
    return
  }

  const tokens = existing.split(',').map((token) => token.trim().toLowerCase())
  if (!tokens.includes('accept') && !tokens.includes('*')) {
    headers.set('Vary', `${existing}, Accept`)
  }
}

/** `/blog` -> `/blog.md`, `/` -> `/index.md`. */
export function markdownSiblingPath(pathname: string): string {
  const normalized = normalizeContentPath(pathname)
  return normalized === '/' ? '/index.md' : `${normalized}.md`
}

/** `/blog.md` -> `/blog`, `/index.md` -> `/`. */
export function contentPathFromMarkdownPath(pathname: string): string {
  if (!pathname.endsWith('.md')) {
    return normalizeContentPath(pathname)
  }

  const stripped = pathname.slice(0, -'.md'.length)
  return stripped === '/index' || stripped === '' ? '/' : normalizeContentPath(stripped)
}

export function normalizeContentPath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/'
  }

  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '')

  return withoutTrailingSlash || '/'
}

const NON_NEGOTIABLE_PREFIXES = [
  '/api/',
  '/_next/',
  '/_vercel/',
  '/static/',
  '/monitoring',
  '/.well-known/',
]

/**
 * Only HTML document routes take part in negotiation. Anything that already has
 * its own media type (feeds, sitemaps, llms.txt, images) is left untouched.
 */
export function isNegotiablePath(pathname: string): boolean {
  if (NON_NEGOTIABLE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false
  }

  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1)
  return !/\.[a-z0-9]+$/i.test(lastSegment)
}
