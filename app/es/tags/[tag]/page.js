import ListLayout from '@/layouts/ListLayout'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'

export async function generateStaticParams() {
  const tags = await getAllTags('blog', { locale: 'es' })
  return Object.keys(tags).map((tag) => ({ tag }))
}

export async function generateMetadata({ params }) {
  const { tag } = await params
  const englishTags = await getAllTags('blog', { locale: 'en' })
  const hasEnglishVersion = Object.prototype.hasOwnProperty.call(englishTags, tag)
  const languageAlternates = {
    'es-ES': `/es/tags/${tag}`,
    'x-default': `/es/tags/${tag}`,
  }
  if (hasEnglishVersion) {
    languageAlternates['en-US'] = `/tags/${tag}`
    languageAlternates['x-default'] = `/tags/${tag}`
  }

  return {
    title: `${tag} - ${siteMetadata.author}`,
    description: `${tag} tags - ${siteMetadata.author}`,
    alternates: {
      canonical: `/es/tags/${tag}`,
      languages: languageAlternates,
      types: {
        'application/rss+xml': `/es/tags/${tag}/feed.xml`,
      },
    },
  }
}

export default async function SpanishTagPage({ params }) {
  const { tag } = await params
  const allPosts = await getAllFilesFrontMatter('blog', { locale: 'es' })
  const posts = allPosts.filter(
    (post) => post.draft !== true && post.tags.map((postTag) => kebabCase(postTag)).includes(tag)
  )
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)

  return <ListLayout posts={posts} title={title} />
}
