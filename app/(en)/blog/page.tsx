import ListLayout from '@/layouts/ListLayout'
import PaginationLinkTags from '@/components/PaginationLinkTags'
import { localizedMetadata } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { POSTS_PER_PAGE } from '@/lib/posts'

export const metadata = localizedMetadata({ kind: 'blog', locale: 'en' })

export default async function BlogPage() {
  const posts = await getAllFilesFrontMatter('blog', { locale: 'en' })
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
        locale="en"
      />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        locale="en"
        pagination={pagination}
        title="All Posts"
      />
    </>
  )
}
