import ListLayout from '@/layouts/ListLayout'
import siteMetadata from '@/data/siteMetadata'
import { getBlogPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { POSTS_PER_PAGE } from '@/lib/posts'

const title = 'Blog'
const description = siteMetadata.description

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: getBlogPath('en'),
    locale: 'en',
    alternateLocales: ['es'],
  }),
  alternates: {
    canonical: getBlogPath('en'),
    languages: {
      'en-US': getBlogPath('en'),
      'es-ES': getBlogPath('es'),
      'x-default': getBlogPath('en'),
    },
  },
}

export default async function BlogPage() {
  const posts = await getAllFilesFrontMatter('blog', { locale: 'en' })
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
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
