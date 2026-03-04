import { notFound } from 'next/navigation'

import PageTitle from '@/components/PageTitle'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import siteMetadata from '@/data/siteMetadata'
import { formatSlug, getAllFilesFrontMatter, getFileBySlug, getFiles } from '@/lib/mdx'
import {
  buildLanguageAlternates,
  getRelatedPosts,
  getTranslationsForPost,
} from '@/lib/post-relations'

const DEFAULT_LAYOUT = 'PostLayout'

export async function generateStaticParams() {
  const posts = getFiles('blog')
  return posts.map((post) => ({
    slug: formatSlug(post).split('/'),
  }))
}

export async function generateMetadata({ params }) {
  const { slug: slugParts } = await params
  if (
    !Array.isArray(slugParts) ||
    slugParts.length === 0 ||
    slugParts.some((part) => part[0] === '.')
  ) {
    return {}
  }

  const slug = slugParts.join('/')
  const knownSlugs = getFiles('blog').map((post) => formatSlug(post))
  if (!knownSlugs.includes(slug)) {
    return {}
  }

  const post = await getFileBySlug('blog', slug)
  const frontMatter = post.frontMatter
  const allPosts = await getAllFilesFrontMatter('blog')
  const languageAlternates = buildLanguageAlternates(allPosts, frontMatter)
  const translatedPosts = getTranslationsForPost(allPosts, frontMatter)
  const openGraphLocale = frontMatter.locale === 'es' ? 'es_ES' : 'en_US'
  const openGraphAlternateLocales = translatedPosts.map((translatedPost) =>
    translatedPost.locale === 'es' ? 'es_ES' : 'en_US'
  )
  const image = frontMatter.images?.[0] || siteMetadata.socialBanner
  const imageUrl = image.startsWith('http') ? image : `${siteMetadata.siteUrl}${image}`
  const alternates = {
    canonical: frontMatter.canonicalUrl || `/${frontMatter.slug}`,
  }

  if (Object.keys(languageAlternates).length > 0) {
    alternates.languages = languageAlternates
  }

  return {
    title: frontMatter.title,
    description: frontMatter.summary || siteMetadata.description,
    alternates,
    openGraph: {
      title: frontMatter.title,
      description: frontMatter.summary || siteMetadata.description,
      type: 'article',
      url: `${siteMetadata.siteUrl}/${frontMatter.slug}`,
      images: [imageUrl],
      locale: openGraphLocale,
      alternateLocale: openGraphAlternateLocales,
      publishedTime: frontMatter.date || undefined,
      modifiedTime: frontMatter.lastmod || frontMatter.date || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: frontMatter.title,
      description: frontMatter.summary || siteMetadata.description,
      images: [imageUrl],
    },
  }
}

export default async function BlogPostPage({ params }) {
  const { slug: slugParts } = await params
  if (
    !Array.isArray(slugParts) ||
    slugParts.length === 0 ||
    slugParts.some((part) => part[0] === '.')
  ) {
    notFound()
  }

  const slug = slugParts.join('/')
  const knownSlugs = getFiles('blog').map((postFile) => formatSlug(postFile))
  if (!knownSlugs.includes(slug)) {
    notFound()
  }

  const post = await getFileBySlug('blog', slug)
  const authorList = post.frontMatter.authors || ['default']
  const authorDetails = await Promise.all(
    authorList.map(async (author) => (await getFileBySlug('authors', author)).frontMatter)
  )

  const { mdxSource, toc, frontMatter } = post

  if (frontMatter.draft === true) {
    return (
      <div className="mt-24 text-center">
        <PageTitle>
          Under Construction{' '}
          <span role="img" aria-label="roadwork sign">
            🚧
          </span>
        </PageTitle>
      </div>
    )
  }

  const allPosts = await getAllFilesFrontMatter('blog')
  const localePosts = allPosts.filter((postItem) => postItem.locale === frontMatter.locale)
  const postIndex = localePosts.findIndex((postItem) => formatSlug(postItem.slug) === slug)
  if (postIndex === -1) {
    notFound()
  }

  const prev = localePosts[postIndex + 1] || null
  const next = localePosts[postIndex - 1] || null
  const relatedPosts = getRelatedPosts(allPosts, frontMatter, 3)
  const languageVersions = getTranslationsForPost(allPosts, frontMatter).map((translatedPost) => ({
    href: `/${translatedPost.slug}`,
    title: translatedPost.title,
    locale: translatedPost.locale,
    languageLabel: translatedPost.locale === 'es' ? 'Español' : 'English',
  }))

  return (
    <MDXLayoutRenderer
      layout={frontMatter.layout || DEFAULT_LAYOUT}
      toc={toc}
      mdxSource={mdxSource}
      frontMatter={frontMatter}
      authorDetails={authorDetails}
      prev={prev}
      next={next}
      relatedPosts={relatedPosts}
      languageVersions={languageVersions}
    />
  )
}
