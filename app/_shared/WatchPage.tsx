import { notFound, permanentRedirect } from 'next/navigation'

import Link from '@/components/Link'
import { YouTubePlayer } from '@/components/MdxEmbed'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import SeoSchema from '@/components/SeoSchema'
import siteMetadata from '@/data/siteMetadata'
import { getLanguageLabel } from '@/lib/i18n/config'
import { getPostPath } from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'
import { formatSlug, getAllFilesFrontMatter, getFileBySlug } from '@/lib/mdx'
import { getTranslationsForPost } from '@/lib/post-relations'
import { getVideoPosts } from '@/lib/video'
import formatDate from '@/lib/utils/formatDate'
import type { ContentFrontMatter, Locale, VideoFrontMatter } from '@/types/content'
import type { SlugPageProps } from '@/types/next'
import type { Metadata } from 'next'

type VideoPost = ContentFrontMatter & { video: VideoFrontMatter }

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

function hasVideo(post: ContentFrontMatter): post is VideoPost {
  return Boolean(post.video?.watchPagePath)
}

function buildWatchAlternates(
  posts: ContentFrontMatter[],
  frontMatter: ContentFrontMatter
): Record<string, string> {
  const translations = [frontMatter, ...getTranslationsForPost(posts, frontMatter)].filter(hasVideo)

  if (translations.length <= 1) {
    return {}
  }

  const alternates: Record<string, string> = {}

  translations.forEach((post) => {
    alternates[post.locale === 'es' ? 'es-ES' : 'en-US'] = post.video.watchPagePath
  })

  if (alternates['en-US']) {
    alternates['x-default'] = alternates['en-US']
  }

  return alternates
}

function toOpenGraphLocale(locale: Locale): string {
  return locale === 'es' ? 'es_ES' : 'en_US'
}

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

function getResolvedVideoPost(
  slugParts: string[] | undefined,
  posts: ContentFrontMatter[]
): VideoPost | null {
  const slug = getSlugFromParts(slugParts)

  if (!slug) {
    return null
  }

  return (
    posts.find((post): post is VideoPost => formatSlug(post.slug) === slug && hasVideo(post)) ||
    null
  )
}

export async function generateWatchStaticParams(locale: Locale) {
  const posts = await getAllFilesFrontMatter('blog', { locale })

  return getVideoPosts(posts).map((post) => ({
    slug: formatSlug(post.slug).split('/'),
  }))
}

export async function generateWatchMetadata(
  { params }: SlugPageProps,
  locale: Locale
): Promise<Metadata> {
  const { slug: slugParts } = await params
  const allPosts = await getAllFilesFrontMatter('blog')
  const post = getResolvedVideoPost(slugParts, allPosts)

  if (!post) {
    return {}
  }

  if (post.locale !== locale) {
    return {
      alternates: {
        canonical: post.video.watchPagePath,
      },
      robots: {
        index: false,
        follow: true,
      },
    }
  }

  const frontMatter = (await getFileBySlug('blog', post.slug)).frontMatter
  const video = frontMatter.video
  if (!video) {
    return {}
  }
  const pageUrl = `${siteMetadata.siteUrl}${video.watchPagePath}`
  const alternates: { canonical: string; languages?: Record<string, string> } = {
    canonical: video.watchPagePath,
  }
  const languageAlternates = buildWatchAlternates(allPosts, frontMatter)
  const translatedPosts = getTranslationsForPost(allPosts, frontMatter).filter(hasVideo)

  if (Object.keys(languageAlternates).length > 0) {
    alternates.languages = languageAlternates
  }

  return {
    title: video.title,
    description: video.description || frontMatter.summary || siteMetadata.description,
    alternates,
    openGraph: {
      title: video.title,
      description: video.description || frontMatter.summary || siteMetadata.description,
      type: 'video.other',
      url: pageUrl,
      images: [video.thumbnailUrl],
      locale: toOpenGraphLocale(frontMatter.locale),
      alternateLocale: translatedPosts.map((translatedPost) =>
        toOpenGraphLocale(translatedPost.locale)
      ),
      publishedTime: video.uploadDate || frontMatter.date || undefined,
      modifiedTime: frontMatter.lastmod || video.uploadDate || frontMatter.date || undefined,
    } as any,
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description: video.description || frontMatter.summary || siteMetadata.description,
      images: [video.thumbnailUrl],
    },
  }
}

export default async function WatchPage({
  params,
  locale = 'en',
}: SlugPageProps & { locale?: Locale }) {
  const { slug: slugParts } = await params
  const allPosts = await getAllFilesFrontMatter('blog')
  const post = getResolvedVideoPost(slugParts, allPosts)

  if (!post) {
    notFound()
  }

  if (post.locale !== locale) {
    permanentRedirect(post.video.watchPagePath)
  }

  const { frontMatter } = await getFileBySlug('blog', post.slug)
  const video = frontMatter.video

  if (!video) {
    notFound()
  }

  const pageUrl = `${siteMetadata.siteUrl}${video.watchPagePath}`
  const articlePath = getPostPath(frontMatter)
  const articleUrl = `${siteMetadata.siteUrl}${articlePath}`
  const { video: videoUi } = getUiCopy(frontMatter.locale)
  const languageVersions = getTranslationsForPost(allPosts, frontMatter)
    .filter(hasVideo)
    .map((translatedPost) => ({
      href: translatedPost.video.watchPagePath,
      label: getLanguageLabel(translatedPost.locale),
      title: translatedPost.video.title,
    }))

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || siteMetadata.description,
    thumbnailUrl: [video.thumbnailUrl],
    embedUrl: video.embedUrl,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    inLanguage: frontMatter.locale === 'es' ? 'es-ES' : 'en-US',
    publisher: {
      '@type': 'Person',
      name: siteMetadata.author,
      url: siteMetadata.siteUrl,
    },
    potentialAction: {
      '@type': 'WatchAction',
      target: pageUrl,
    },
    ...(video.uploadDate ? { uploadDate: video.uploadDate } : {}),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: videoUi.homeLabel,
        item: siteMetadata.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: videoUi.articleLabel,
        item: articleUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: video.title,
        item: pageUrl,
      },
    ],
  }

  return (
    <SectionContainer>
      <article lang={frontMatter.locale || 'en'} className="mx-auto max-w-4xl py-10">
        <SeoSchema data={videoSchema} />
        <SeoSchema data={breadcrumbSchema} />
        <div className="space-y-8">
          <div className="space-y-4">
            <Link
              href={articlePath}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              &larr; {videoUi.backToArticle}
            </Link>
            <div className="space-y-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {videoUi.watchPageLabel}
              </p>
              <PageTitle>{video.title}</PageTitle>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground">
                {video.description || siteMetadata.description}
              </p>
              {(video.uploadDate || frontMatter.date) && (
                <time
                  dateTime={video.uploadDate || frontMatter.date || undefined}
                  className="block text-sm text-muted-foreground"
                >
                  {formatDate(
                    video.uploadDate || frontMatter.date,
                    frontMatter.locale,
                    postDateTemplate
                  )}
                </time>
              )}
            </div>
          </div>

          <YouTubePlayer youTubeId={video.youTubeId} title={video.title} />

          <div className="flex flex-wrap gap-3">
            <Link
              href={articlePath}
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-(--duration-ui) ease-(--ease-out-soft) hover:bg-primary/90"
            >
              {videoUi.readArticle}
            </Link>
            <Link
              href={video.watchUrl}
              className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary dark:hover:border-primary"
            >
              {videoUi.watchOnYouTube}
            </Link>
          </div>

          {languageVersions.length > 0 && (
            <div className="rounded-2xl border border-border p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {videoUi.translations}
              </h2>
              <ul className="mt-3 space-y-2">
                {languageVersions.map((translatedPost) => (
                  <li key={translatedPost.href}>
                    <Link
                      href={translatedPost.href}
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {translatedPost.label}: {translatedPost.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>
    </SectionContainer>
  )
}
