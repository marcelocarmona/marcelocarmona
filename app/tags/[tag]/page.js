import ListLayout from '@/layouts/ListLayout'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'

export async function generateStaticParams() {
  const tags = await getAllTags('blog')
  return Object.keys(tags).map((tag) => ({ tag }))
}

export async function generateMetadata({ params }) {
  const { tag } = await params

  return {
    title: `${tag} - ${siteMetadata.author}`,
    description: `${tag} tags - ${siteMetadata.author}`,
    alternates: {
      types: {
        'application/rss+xml': `/tags/${tag}/feed.xml`,
      },
    },
  }
}

export default async function TagPage({ params }) {
  const { tag } = await params
  const allPosts = await getAllFilesFrontMatter('blog')
  const posts = allPosts.filter(
    (post) => post.draft !== true && post.tags.map((postTag) => kebabCase(postTag)).includes(tag)
  )
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)

  return <ListLayout posts={posts} title={title} />
}
