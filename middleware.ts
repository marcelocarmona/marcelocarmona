import { NextResponse, type NextRequest } from 'next/server'

import {
  appendVaryAccept,
  contentPathFromMarkdownPath,
  isNegotiablePath,
  markdownSiblingPath,
  preferredType,
} from '@/lib/content-negotiation'

const MARKDOWN_ROUTE_PREFIX = '/api/markdown'

/**
 * Markdown content negotiation, per https://acceptmarkdown.com.
 *
 * `Vary: Accept` is set here for route-handler and self-hosted responses, but
 * Next.js overwrites `Vary` on App Router *page* responses with its own RSC
 * token list (`res.setHeader('Vary', ...)` in the compiled app-page template),
 * so neither middleware nor `next.config` headers survive there. The edge rule
 * in vercel.json restores `Accept` on those responses; `tests/agent-readiness`
 * fails if that rule ever drifts from the tokens Next.js emits.
 */

function toMarkdownRoute(pathname: string): string {
  return pathname === '/' ? MARKDOWN_ROUTE_PREFIX : `${MARKDOWN_ROUTE_PREFIX}${pathname}`
}

function markdownAlternateLink(request: NextRequest, pathname: string): string {
  const url = new URL(markdownSiblingPath(pathname), request.nextUrl.origin)
  return `<${url.toString()}>; rel="alternate"; type="text/markdown"`
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only GET/HEAD have a representation to negotiate. Server Actions and form
  // posts target page URLs with `Accept: text/x-component`, which would
  // otherwise be answered with a 406 and break the submission.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return NextResponse.next()
  }

  // Explicit `.md` sibling: always Markdown, even without an Accept header.
  // This is the URL advertised by the `Link: rel="alternate"` header below.
  if (pathname.endsWith('.md')) {
    const url = request.nextUrl.clone()
    url.pathname = toMarkdownRoute(contentPathFromMarkdownPath(pathname))

    const rewritten = NextResponse.rewrite(url)
    appendVaryAccept(rewritten.headers)
    return rewritten
  }

  if (!isNegotiablePath(pathname)) {
    return NextResponse.next()
  }

  // React Server Component payload requests send `Accept: */*`, which resolves
  // to `text/html` below and falls through to the app router untouched. Next.js
  // strips both the `RSC` header and the `_rsc` query parameter before
  // middleware runs, so there is nothing more specific to branch on here.
  const acceptHeader = request.headers.get('accept')
  const chosen = preferredType(acceptHeader)

  if (chosen === 'text/markdown') {
    const url = request.nextUrl.clone()
    url.pathname = toMarkdownRoute(pathname)

    const rewritten = NextResponse.rewrite(url)
    appendVaryAccept(rewritten.headers)
    return rewritten
  }

  if (chosen === null) {
    const response = new NextResponse(
      'Not Acceptable\n\nAvailable representations: text/html, text/markdown\n',
      {
        status: 406,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          Vary: 'Accept',
        },
      }
    )
    response.headers.set('Link', markdownAlternateLink(request, pathname))
    return response
  }

  const response = NextResponse.next()
  appendVaryAccept(response.headers)
  response.headers.set('Link', markdownAlternateLink(request, pathname))
  return response
}

export const config = {
  matcher: ['/((?!_next/|_vercel/|api/|monitoring|static/|favicon\\.ico).*)'],
}
