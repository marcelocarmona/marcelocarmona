import ListLayout from '@/layouts/ListLayout'
import PaginationLinkTags from '@/components/PaginationLinkTags'
import { localizedMetadata } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { POSTS_PER_PAGE } from '@/lib/posts'

export const metadata = localizedMetadata({ kind: 'blog', locale: 'es' })

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
        title="Todos los Artículos"
      />
    </>
  )
}
