import { notFound } from 'next/navigation'

import ListLayout from '@/layouts/ListLayout'
import PaginationLinkTags from '@/components/PaginationLinkTags'
import { localizedMetadata } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { POSTS_PER_PAGE } from '@/lib/posts'
import type { PageNumberProps } from '@/types/next'

export async function generateMetadata({ params }: PageNumberProps) {
  const { page } = await params
  const parsedPage = parseInt(page, 10)
  const pageNumber = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

  return localizedMetadata({ kind: 'blog', locale: 'en', page: pageNumber })
}

export async function generateStaticParams() {
  const totalPosts = await getAllFilesFrontMatter('blog', { locale: 'en' })
  const totalPages = Math.ceil(totalPosts.length / POSTS_PER_PAGE)
  return Array.from({ length: totalPages }, (_, i) => ({
    page: (i + 1).toString(),
  }))
}

export default async function BlogPaginationPage({ params }: PageNumberProps) {
  const { page } = await params
  const pageNumber = parseInt(page, 10)
  if (Number.isNaN(pageNumber) || pageNumber < 1) {
    notFound()
  }

  const posts = await getAllFilesFrontMatter('blog', { locale: 'en' })
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  if (pageNumber > totalPages) {
    notFound()
  }

  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages,
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
