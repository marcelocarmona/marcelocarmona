import ListLayout from '@/layouts/ListLayout'
import siteMetadata from '@/data/siteMetadata'
import { getTagPath } from '@/lib/i18n/routes'
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
    'es-ES': getTagPath('es', tag),
    'x-default': getTagPath('es', tag),
  }
  if (hasEnglishVersion) {
    languageAlternates['en-US'] = getTagPath('en', tag)
    languageAlternates['x-default'] = getTagPath('en', tag)
  }

  return {
    title: tag,
    description: `Articulos etiquetados con ${tag} por ${siteMetadata.author}`,
    alternates: {
      canonical: getTagPath('es', tag),
      languages: languageAlternates,
      types: {
        'application/rss+xml': `${getTagPath('es', tag)}/feed.xml`,
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

  return <ListLayout locale="es" posts={posts} title={title} />
}
