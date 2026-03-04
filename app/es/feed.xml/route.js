import generateRss from '@/lib/generate-rss'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'

export const runtime = 'nodejs'

export async function GET() {
  const posts = await getAllFilesFrontMatter('blog', { locale: 'es' })
  const rss = generateRss(posts, 'es/feed.xml', {
    title: `${siteMetadata.title} - ES`,
    description: 'Articulos en espanol sobre desarrollo web y software.',
    language: 'es-es',
    link: `${siteMetadata.siteUrl}/es/blog`,
  })

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
