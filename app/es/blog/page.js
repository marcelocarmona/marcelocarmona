import ListLayout from '@/layouts/ListLayout'
import siteMetadata from '@/data/siteMetadata'
import { getBlogPath, getFeedPath } from '@/lib/i18n/routes'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { POSTS_PER_PAGE } from '@/lib/posts'

export const metadata = {
  title: `Blog ES - ${siteMetadata.author}`,
  description: 'Articulos en espanol sobre desarrollo web.',
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
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      locale="es"
      pagination={pagination}
      title="Todos los Articulos"
    />
  )
}
