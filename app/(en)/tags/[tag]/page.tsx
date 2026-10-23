import { notFound } from 'next/navigation'

import ListLayout from '@/layouts/ListLayout'
import { SUPPORTED_LOCALES } from '@/lib/i18n/config'
import { localizedMetadata } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'
import type { TagPageProps } from '@/types/next'

export async function generateStaticParams() {
  const tags = await getAllTags('blog', { locale: 'en' })
  return Object.keys(tags).map((tag) => ({ tag }))
}

export async function generateMetadata({ params }: TagPageProps) {
  const { tag } = await params
  const tagsByLocale = {
    en: await getAllTags('blog', { locale: 'en' }),
    es: await getAllTags('blog', { locale: 'es' }),
  }

  return localizedMetadata({
    kind: 'tag',
    locale: 'en',
    tag,
    postCount: tagsByLocale.en[tag] ?? 0,
    availableLocales: SUPPORTED_LOCALES.filter((locale) => tag in tagsByLocale[locale]),
  })
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const allPosts = await getAllFilesFrontMatter('blog', { locale: 'en' })
  const posts = allPosts.filter(
    (post) =>
      post.draft !== true && (post.tags || []).map((postTag) => kebabCase(postTag)).includes(tag)
  )

  // Without this an unknown tag renders an empty page with HTTP 200, telling
  // crawlers and agents that every /tags/* path exists.
  if (!posts.length) {
    notFound()
  }

  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)

  return <ListLayout locale="en" posts={posts} title={title} />
}
