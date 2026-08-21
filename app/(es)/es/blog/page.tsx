import ListLayout from '@/layouts/ListLayout'
import PaginationLinkTags from '@/components/PaginationLinkTags'
import siteMetadata from '@/data/siteMetadata'
import { getBlogPath, getFeedPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { POSTS_PER_PAGE } from '@/lib/posts'

const title = 'Blog en espanol'
const description = `Articulos en espanol de ${siteMetadata.author} sobre React, Next.js, rendimiento web y arquitectura frontend.`

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: getBlogPath('es'),
    locale: 'es',
    alternateLocales: ['en'],
  }),
  alternates: {
    canonical: getBlogPath('es'),
    languages: {
      'en-US': getBlogPath('en'),
      'es-ES': getBlogPath('es'),
      'x-default': getBlogPath('en'),
    },
    types: {
      'application/rss+xml': getFeedPath('es'),
    },
  },
}

export default async function SpanishBlogPage() {
  const posts = await getAllFilesFrontMatter('blog', { locale: 'es' })
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return (
    <>
      <PaginationLinkTags
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        locale="es"
      />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        locale="es"
        pagination={pagination}
        title="Todos los Articulos"
      />
    </>
  )
}
