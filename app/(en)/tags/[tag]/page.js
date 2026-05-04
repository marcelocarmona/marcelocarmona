import ListLayout from '@/layouts/ListLayout'
import siteMetadata from '@/data/siteMetadata'
import { getTagPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'

export async function generateStaticParams() {
  const tags = await getAllTags('blog', { locale: 'en' })
  return Object.keys(tags).map((tag) => ({ tag }))
}

export async function generateMetadata({ params }) {
  const { tag } = await params
  const spanishTags = await getAllTags('blog', { locale: 'es' })
  const hasSpanishVersion = Object.prototype.hasOwnProperty.call(spanishTags, tag)
  const languageAlternates = {
    'en-US': getTagPath('en', tag),
    'x-default': getTagPath('en', tag),
  }
  if (hasSpanishVersion) {
    languageAlternates['es-ES'] = getTagPath('es', tag)
  }
  const title = tag
  const description = `Posts tagged ${tag} by ${siteMetadata.author}`

  return {
    ...buildPageMetadata({
      title,
      description,
      path: getTagPath('en', tag),
      locale: 'en',
      alternateLocales: hasSpanishVersion ? ['es'] : [],
    }),
    alternates: {
      canonical: getTagPath('en', tag),
      languages: languageAlternates,
      types: {
        'application/rss+xml': `${getTagPath('en', tag)}/feed.xml`,
      },
    },
  }
}

export default async function TagPage({ params }) {
  const { tag } = await params
  const allPosts = await getAllFilesFrontMatter('blog', { locale: 'en' })
  const posts = allPosts.filter(
    (post) => post.draft !== true && post.tags.map((postTag) => kebabCase(postTag)).includes(tag)
  )
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)

  return <ListLayout locale="en" posts={posts} title={title} />
}
