import { getPostPath } from '@/lib/i18n/routes'
import { absoluteUrl } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { POSTS_PER_PAGE } from '@/lib/posts'
import { getSitemapStaticPaths } from '@/lib/site-catalog'
import kebabCase from '@/lib/utils/kebabCase'
import type { MetadataRoute } from 'next'

interface SitemapRoute {
  route: string
  lastModified?: string | null
}

export const runtime = 'nodejs'

function getPaginationRoutes(baseRoute: string, totalPages: number): string[] {
  return Array.from({ length: totalPages }, (_, i) =>
    i + 1 === 1 ? baseRoute : `${baseRoute}/page/${i + 1}`
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllFilesFrontMatter('blog')
  const englishPosts = posts.filter((post) => post.locale === 'en')
  const spanishPosts = posts.filter((post) => post.locale === 'es')
  const englishTotalPages = Math.ceil(englishPosts.length / POSTS_PER_PAGE)
  const spanishTotalPages = Math.ceil(spanishPosts.length / POSTS_PER_PAGE)

  const blogPaginationRoutes = getPaginationRoutes('/blog', englishTotalPages)
  const spanishBlogPaginationRoutes = getPaginationRoutes('/es/blog', spanishTotalPages)
  const blogPostRoutes = posts.map((post) => ({
    route: getPostPath(post),
    lastModified: post.lastmod || post.date || undefined,
  }))
  const watchPageRoutes = posts
    .filter((post) => post.video?.watchPagePath)
    .map((post) => ({
      route: post.video?.watchPagePath || '',
      lastModified: post.lastmod || post.date || undefined,
    }))

  const englishTagSet = new Set<string>()
  const spanishTagSet = new Set<string>()
  englishPosts.forEach((post) => {
    post.tags?.forEach((tag) => {
      englishTagSet.add(kebabCase(tag))
    })
  })
  spanishPosts.forEach((post) => {
    post.tags?.forEach((tag) => {
      spanishTagSet.add(kebabCase(tag))
    })
  })

  const tagRoutes = Array.from(englishTagSet).map((tag) => ({ route: `/tags/${tag}` }))
  const spanishTagRoutes = Array.from(spanishTagSet).map((tag) => ({ route: `/es/tags/${tag}` }))

  const routeMap = new Map<string, SitemapRoute>()

  const addRoute = ({ route, lastModified }: SitemapRoute) => {
    if (!routeMap.has(route)) {
      routeMap.set(route, { route, lastModified })
      return
    }

    const currentRoute = routeMap.get(route)
    if (currentRoute && !currentRoute.lastModified && lastModified) {
      routeMap.set(route, { route, lastModified })
    }
  }

  getSitemapStaticPaths().forEach((route) => addRoute({ route }))
  blogPaginationRoutes.forEach((route) => addRoute({ route }))
  spanishBlogPaginationRoutes.forEach((route) => addRoute({ route }))
  blogPostRoutes.forEach(addRoute)
  watchPageRoutes.forEach(addRoute)
  tagRoutes.forEach(addRoute)
  spanishTagRoutes.forEach(addRoute)

  return Array.from(routeMap.values()).map((entry) => ({
    url: absoluteUrl(entry.route),
    ...(entry.lastModified ? { lastModified: new Date(entry.lastModified) } : {}),
  }))
}
