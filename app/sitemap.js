import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { POSTS_PER_PAGE } from '@/lib/posts'
import kebabCase from '@/lib/utils/kebabCase'

export const runtime = 'nodejs'

export default async function sitemap() {
  const posts = await getAllFilesFrontMatter('blog')
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  const staticRoutes = ['', '/about', '/projects', '/blog', '/tags', '/sentry-example-page']

  const blogPaginationRoutes = Array.from({ length: totalPages }, (_, i) =>
    i + 1 === 1 ? '/blog' : `/blog/page/${i + 1}`
  )
  const blogPostRoutes = posts.map((post) => `/${post.slug}`)
  const tagSet = new Set()
  posts.forEach((post) => {
    post.tags?.forEach((tag) => {
      tagSet.add(kebabCase(tag))
    })
  })
  const tagRoutes = Array.from(tagSet).map((tag) => `/tags/${tag}`)

  return [
    ...new Set([...staticRoutes, ...blogPaginationRoutes, ...blogPostRoutes, ...tagRoutes]),
  ].map((route) => ({
    url: `${siteMetadata.siteUrl}${route}`,
  }))
}
