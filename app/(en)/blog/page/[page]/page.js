import { notFound } from 'next/navigation'

import ListLayout from '@/layouts/ListLayout'
import siteMetadata from '@/data/siteMetadata'
import { getBlogPagePath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { POSTS_PER_PAGE } from '@/lib/posts'

export async function generateMetadata({ params }) {
  const { page } = await params
  const parsedPage = parseInt(page, 10)
  const pageNumber = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage
  const canonicalPath = getBlogPagePath('en', pageNumber)
  const spanishPath = getBlogPagePath('es', pageNumber)
  const title = `Blog Page ${pageNumber}`
  const description = siteMetadata.description

  return {
    ...buildPageMetadata({
      title,
      description,
      path: canonicalPath,
      locale: 'en',
      alternateLocales: ['es'],
    }),
    alternates: {
      canonical: canonicalPath,
      languages: {
        'en-US': canonicalPath,
        'es-ES': spanishPath,
        'x-default': canonicalPath,
      },
    },
  }
}

export async function generateStaticParams() {
  const totalPosts = await getAllFilesFrontMatter('blog', { locale: 'en' })
  const totalPages = Math.ceil(totalPosts.length / POSTS_PER_PAGE)
  return Array.from({ length: totalPages }, (_, i) => ({
    page: (i + 1).toString(),
  }))
}

export default async function BlogPaginationPage({ params }) {
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
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      locale="en"
      pagination={pagination}
      title="All Posts"
    />
  )
}
