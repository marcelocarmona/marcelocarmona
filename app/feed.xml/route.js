import generateRss from '@/lib/generate-rss'
import { getAllFilesFrontMatter } from '@/lib/mdx'

export const runtime = 'nodejs'

export async function GET() {
  const posts = await getAllFilesFrontMatter('blog', { locale: 'en' })
  const rss = generateRss(posts)

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
