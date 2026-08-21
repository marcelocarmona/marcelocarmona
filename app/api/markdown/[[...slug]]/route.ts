import { MARKDOWN_CONTENT_TYPE, markdownSiblingPath } from '@/lib/content-negotiation'
import { getMarkdownDocument } from '@/lib/markdown-representation'
import { absoluteUrl } from '@/lib/metadata'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ slug?: string[] }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug = [] } = await params
  // Next.js has already percent-decoded these segments. Decoding again turns a
  // literal `%` into a URIError, and a decoded newline into an invalid header
  // value, so the lookup path stays decoded and header URLs are re-encoded.
  const pathname = `/${slug.join('/')}`
  const encodedPathname = `/${slug.map(encodeURIComponent).join('/')}`
  const document = await getMarkdownDocument(pathname)

  return new Response(document.body, {
    status: document.status,
    headers: {
      'Content-Type': MARKDOWN_CONTENT_TYPE,
      Vary: 'Accept',
      Link: [
        `<${absoluteUrl(encodedPathname)}>; rel="canonical"`,
        `<${absoluteUrl(markdownSiblingPath(encodedPathname))}>; rel="alternate"; type="text/markdown"`,
      ].join(', '),
      'Cache-Control':
        document.status === 200
          ? 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
          : 'no-store',
    },
  })
}
