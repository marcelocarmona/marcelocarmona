import generateRss from '@/lib/generate-rss'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import kebabCase from '@/lib/utils/kebabCase'

export const runtime = 'nodejs'

export async function GET(_request, { params }) {
  const { tag } = await params
  const allPosts = await getAllFilesFrontMatter('blog', { locale: 'es' })
  const posts = allPosts.filter((post) =>
    post.tags.map((postTag) => kebabCase(postTag)).includes(tag)
  )
  const rss = generateRss(posts, `es/tags/${tag}/feed.xml`, {
    title: `${siteMetadata.title} - ${tag} (ES)`,
    description: `Articulos en espanol sobre ${tag}.`,
    language: 'es-es',
    link: `${siteMetadata.siteUrl}/es/tags/${tag}`,
  })

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
