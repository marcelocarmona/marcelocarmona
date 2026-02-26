import generateRss from '@/lib/generate-rss'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import kebabCase from '@/lib/utils/kebabCase'

export const runtime = 'nodejs'

export async function GET(_request, { params }) {
  const { tag } = await params
  const allPosts = await getAllFilesFrontMatter('blog')
  const posts = allPosts.filter((post) =>
    post.tags.map((postTag) => kebabCase(postTag)).includes(tag)
  )
  const rss = generateRss(posts, `tags/${tag}/feed.xml`)

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
