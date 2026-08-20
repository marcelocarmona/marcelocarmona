import { notFound, permanentRedirect } from 'next/navigation'

import PageTitle from '@/components/PageTitle'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import siteMetadata from '@/data/siteMetadata'
import { getLanguageLabel } from '@/lib/i18n/config'
import { getPostPath } from '@/lib/i18n/routes'
import { formatSlug, getAllFilesFrontMatter, getFileBySlug } from '@/lib/mdx'
import {
  buildLanguageAlternates,
  getRelatedPosts,
  getTranslationsForPost,
} from '@/lib/post-relations'
import type { AuthorFrontMatter, ContentFrontMatter, Locale } from '@/types/content'
import type { SlugPageProps } from '@/types/next'
import type { Metadata } from 'next'

const DEFAULT_LAYOUT = 'PostLayout'

function getSlugFromParts(slugParts: string[] | undefined): string | null {
  if (
    !Array.isArray(slugParts) ||
    slugParts.length === 0 ||
    slugParts.some((part) => part[0] === '.')
  ) {
    return null
  }

  return slugParts.join('/')
}

function findPostBySlug(posts: ContentFrontMatter[], slug: string): ContentFrontMatter | null {
  return posts.find((post) => formatSlug(post.slug) === slug) || null
}

export async function generateBlogPostStaticParams(locale: Locale) {
  const posts = await getAllFilesFrontMatter('blog', { locale })

  return posts.map((post) => ({
    slug: formatSlug(post.slug).split('/'),
  }))
}

export async function generateBlogPostMetadata(
  { params }: SlugPageProps,
  locale: Locale
): Promise<Metadata> {
  const { slug: slugParts } = await params
  const slug = getSlugFromParts(slugParts)

  if (!slug) {
    return {}
  }

  const allPosts = await getAllFilesFrontMatter('blog')
  const postSummary = findPostBySlug(allPosts, slug)

  if (!postSummary) {
    return {}
  }

  if (postSummary.locale !== locale) {
    return {
      alternates: {
        canonical: getPostPath(postSummary),
      },
      robots: {
        index: false,
        follow: true,
      },
    }
  }

  const post = await getFileBySlug('blog', slug)
  const frontMatter = post.frontMatter
  const languageAlternates = buildLanguageAlternates(allPosts, frontMatter)
  const translatedPosts = getTranslationsForPost(allPosts, frontMatter)
  const openGraphLocale = frontMatter.locale === 'es' ? 'es_ES' : 'en_US'
  const openGraphAlternateLocales = translatedPosts.map((translatedPost) =>
    translatedPost.locale === 'es' ? 'es_ES' : 'en_US'
  )
  const image = frontMatter.images?.[0] || siteMetadata.socialBanner
  const imageUrl = image.startsWith('http') ? image : `${siteMetadata.siteUrl}${image}`
  const canonicalPath = frontMatter.canonicalUrl || getPostPath(frontMatter)
  const alternates: { canonical: string; languages?: Record<string, string> } = {
    canonical: canonicalPath,
  }

  if (Object.keys(languageAlternates).length > 0) {
    alternates.languages = languageAlternates
  }

  return {
    title: frontMatter.title,
    description: frontMatter.summary || siteMetadata.description,
    authors: [{ name: siteMetadata.author, url: `${siteMetadata.siteUrl}/about` }],
    creator: siteMetadata.author,
    publisher: siteMetadata.author,
    category: frontMatter.tags?.[0],
    alternates,
    openGraph: {
      title: frontMatter.title,
      description: frontMatter.summary || siteMetadata.description,
      type: 'article',
      siteName: siteMetadata.title,
      url: `${siteMetadata.siteUrl}${getPostPath(frontMatter)}`,
      images: [imageUrl],
      authors: [`${siteMetadata.siteUrl}/about`],
      tags: frontMatter.topics || frontMatter.tags || [],
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

export default async function BlogPostPage({
  params,
  locale = 'en',
}: SlugPageProps & { locale?: Locale }) {
  const { slug: slugParts } = await params
  const slug = getSlugFromParts(slugParts)

  if (!slug) {
    notFound()
  }

  const allPosts = await getAllFilesFrontMatter('blog')
  const postSummary = findPostBySlug(allPosts, slug)

  if (!postSummary) {
    notFound()
  }

  if (postSummary.locale !== locale) {
    permanentRedirect(getPostPath(postSummary))
  }

  const post = await getFileBySlug('blog', slug)
  const authorList = post.frontMatter.authors || ['default']
  const authorDetails: AuthorFrontMatter[] = await Promise.all(
    authorList.map(
      async (author) => (await getFileBySlug('authors', author)).frontMatter as AuthorFrontMatter
    )
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

  const localePosts = allPosts.filter((postItem) => postItem.locale === frontMatter.locale)
  const postIndex = localePosts.findIndex((postItem) => formatSlug(postItem.slug) === slug)
  if (postIndex === -1) {
    notFound()
  }

  const prev = localePosts[postIndex + 1] || null
  const next = localePosts[postIndex - 1] || null
  const relatedPosts = getRelatedPosts(allPosts, frontMatter, 3)
  const languageVersions = getTranslationsForPost(allPosts, frontMatter).map((translatedPost) => ({
    href: getPostPath(translatedPost),
    title: translatedPost.title,
    locale: translatedPost.locale,
    languageLabel: getLanguageLabel(translatedPost.locale),
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
