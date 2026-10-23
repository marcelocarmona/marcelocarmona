import siteMetadata from '@/data/siteMetadata'
import { getTrustPageCopy } from '@/data/trustPages'
import { markdownSiblingPath } from '@/lib/content-negotiation'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, toHreflang, toOpenGraphLocale } from '@/lib/i18n/config'
import {
  getAboutPath,
  getBlogPagePath,
  getBlogPath,
  getBookPath,
  getContactPath,
  getFeedPath,
  getGuidesPath,
  getHomePath,
  getPostPath,
  getPrivacyPath,
  getTagPath,
  getTagsPath,
} from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'
import type { ContentFrontMatter, Locale, VideoFrontMatter } from '@/types/content'
import type { Metadata } from 'next'

type VideoPost = ContentFrontMatter & { video: VideoFrontMatter }

/**
 * Identifies one page in one locale. Routes supply facts; this module decides
 * the copy, canonical URL, hreflang links, Open Graph locales and feeds.
 */
export type PageReference =
  | { kind: 'home' | 'tags' | 'about' | 'book' | 'guides' | 'contact' | 'privacy'; locale: Locale }
  | { kind: 'blog'; locale: Locale; page?: number }
  | {
      kind: 'tag'
      locale: Locale
      tag: string
      postCount: number
      /** Locales that have at least one post with this tag. */
      availableLocales: Locale[]
    }
  | { kind: 'post'; locale: Locale; post: ContentFrontMatter; translations: ContentFrontMatter[] }
  | { kind: 'watch'; locale: Locale; post: VideoPost; translations: ContentFrontMatter[] }
  /** A single-locale page outside the localized route scheme. */
  | { kind: 'standalone'; path: string; title: string; description: string }

type Translations = Partial<Record<Locale, string>>

const socialImage = {
  url: siteMetadata.socialBanner,
  width: 1200,
  height: 600,
  alt: siteMetadata.title,
}

export function absoluteUrl(pathOrUrl = '/'): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }

  if (pathOrUrl === '/') {
    return siteMetadata.siteUrl
  }

  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${siteMetadata.siteUrl}${path}`
}

export function localizedMetadata(page: PageReference): Metadata {
  switch (page.kind) {
    case 'standalone':
      return websiteMetadata({
        locale: DEFAULT_LOCALE,
        title: page.title,
        description: page.description,
        translations: { [DEFAULT_LOCALE]: page.path },
      })
    case 'post':
      return articleMetadata(page)
    case 'watch':
      return videoMetadata(page)
    default:
      return listingMetadata(page)
  }
}

type ListingPage = Exclude<PageReference, { kind: 'standalone' | 'post' | 'watch' }>

function listingMetadata(page: ListingPage): Metadata {
  const { locale } = page
  const { meta } = getUiCopy(locale)
  const pathIn = (target: Locale) => listingPath(page, target)
  const availableLocales = page.kind === 'tag' ? page.availableLocales : SUPPORTED_LOCALES
  const translations = translationsFor(locale, availableLocales, pathIn)

  switch (page.kind) {
    case 'home':
      return websiteMetadata({
        locale,
        ...meta.home,
        translations,
        // The Spanish home is nested below the layout's "%s - Author" title template.
        absoluteTitle: true,
        feed: getFeedPath(locale),
      })
    case 'blog':
      return websiteMetadata({
        locale,
        ...(page.page ? meta.blogPage(page.page) : meta.blog),
        translations,
        feed: page.page ? undefined : getFeedPath(locale),
      })
    case 'tag':
      return websiteMetadata({
        locale,
        ...meta.tag(page.tag, page.postCount),
        translations,
        feed: `${pathIn(locale)}/feed.xml`,
      })
    case 'contact':
    case 'privacy': {
      const { title, description } = getTrustPageCopy(page.kind, locale)
      return websiteMetadata({ locale, title, description, translations })
    }
    default:
      return websiteMetadata({ locale, ...meta[page.kind], translations })
  }
}

function listingPath(page: ListingPage, locale: Locale): string {
  switch (page.kind) {
    case 'home':
      return getHomePath(locale)
    case 'blog':
      return page.page ? getBlogPagePath(locale, page.page) : getBlogPath(locale)
    case 'tags':
      return getTagsPath(locale)
    case 'tag':
      return getTagPath(locale, page.tag)
    case 'about':
      return getAboutPath(locale)
    case 'book':
      return getBookPath(locale)
    case 'guides':
      return getGuidesPath(locale)
    case 'contact':
      return getContactPath(locale)
    case 'privacy':
      return getPrivacyPath(locale)
  }
}

function websiteMetadata({
  locale,
  title,
  description,
  translations,
  absoluteTitle = false,
  feed,
}: {
  locale: Locale
  title: string
  description: string
  translations: Translations
  absoluteTitle?: boolean
  feed?: string
}): Metadata {
  const path = translations[locale] as string
  const imageUrl = absoluteUrl(socialImage.url)

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: alternates({
      canonical: path,
      translations,
      types: feed ? { 'application/rss+xml': feed } : undefined,
    }),
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteMetadata.title,
      images: [{ ...socialImage, url: imageUrl }],
      ...openGraphLocales(locale, translations),
      type: 'website',
    },
    twitter: twitterCard(title, description, imageUrl),
  }
}

function articleMetadata({
  locale,
  post,
  translations: translatedPosts,
}: Extract<PageReference, { kind: 'post' }>): Metadata {
  const articlePath = getPostPath(post)
  if (post.locale !== locale) {
    return wrongLocale(articlePath)
  }

  const title = post.title as string
  const description = post.summary || siteMetadata.description
  const imageUrl = absoluteUrl(post.images?.[0] || siteMetadata.socialBanner)
  const translations = postTranslations(post, translatedPosts, getPostPath)

  return {
    title,
    description,
    authors: [{ name: siteMetadata.author, url: `${siteMetadata.siteUrl}/about` }],
    creator: siteMetadata.author,
    publisher: siteMetadata.author,
    category: post.tags?.[0],
    alternates: alternates({
      canonical: post.canonicalUrl || articlePath,
      translations,
      types: { 'text/markdown': markdownSiblingPath(articlePath) },
    }),
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: siteMetadata.title,
      url: absoluteUrl(articlePath),
      images: [imageUrl],
      authors: [`${siteMetadata.siteUrl}/about`],
      tags: post.topics || post.tags || [],
      ...openGraphLocales(locale, translations),
      publishedTime: post.date || undefined,
      modifiedTime: post.lastmod || post.date || undefined,
    },
    twitter: twitterCard(title, description, imageUrl),
  }
}

function videoMetadata({
  locale,
  post,
  translations: translatedPosts,
}: Extract<PageReference, { kind: 'watch' }>): Metadata {
  const { video } = post
  if (post.locale !== locale) {
    return wrongLocale(video.watchPagePath)
  }

  // Distinguish the watch page from the article it embeds, which shares video.title.
  const title = `${video.title} (${getUiCopy(locale).video.watchPageLabel})`
  const description = video.description || post.summary || siteMetadata.description
  const translations = postTranslations(
    post,
    translatedPosts.filter((translation) => translation.video?.watchPagePath),
    (translation) => (translation.video as VideoFrontMatter).watchPagePath
  )

  return {
    title,
    description,
    alternates: alternates({ canonical: video.watchPagePath, translations }),
    openGraph: {
      title,
      description,
      type: 'video.other',
      url: absoluteUrl(video.watchPagePath),
      images: [video.thumbnailUrl],
      ...openGraphLocales(locale, translations),
      publishedTime: video.uploadDate || post.date || undefined,
      modifiedTime: post.lastmod || video.uploadDate || post.date || undefined,
    } as Metadata['openGraph'],
    twitter: twitterCard(title, description, video.thumbnailUrl),
  }
}

/** A post requested under the wrong locale prefix: point at the real URL and stay out of the index. */
function wrongLocale(canonical: string): Metadata {
  return {
    alternates: { canonical },
    robots: { index: false, follow: true },
  }
}

function translationsFor(
  locale: Locale,
  availableLocales: Locale[],
  pathIn: (locale: Locale) => string
): Translations {
  const translations: Translations = {}
  SUPPORTED_LOCALES.filter(
    (target) => target === locale || availableLocales.includes(target)
  ).forEach((target) => {
    translations[target] = pathIn(target)
  })
  return translations
}

function postTranslations(
  post: ContentFrontMatter,
  translatedPosts: ContentFrontMatter[],
  pathOf: (post: ContentFrontMatter) => string
): Translations {
  const translations: Translations = {}
  ;[post, ...translatedPosts].forEach((version) => {
    translations[version.locale] ??= pathOf(version)
  })
  return translations
}

/**
 * hreflang links are emitted only when the page exists in more than one locale.
 * x-default points at the default-locale version when there is one, else at this page.
 */
function alternates({
  canonical,
  translations,
  types,
}: {
  canonical: string
  translations: Translations
  types?: Record<string, string>
}): NonNullable<Metadata['alternates']> {
  const entries = Object.entries(translations) as [Locale, string][]
  const result: NonNullable<Metadata['alternates']> = { canonical }

  if (entries.length > 1) {
    const languages: Record<string, string> = {}
    entries.forEach(([locale, path]) => {
      languages[toHreflang(locale)] = path
    })
    languages['x-default'] = translations[DEFAULT_LOCALE] ?? canonical
    result.languages = languages
  }

  if (types) {
    result.types = types
  }

  return result
}

function openGraphLocales(locale: Locale, translations: Translations) {
  const alternateLocale = (Object.keys(translations) as Locale[])
    .filter((target) => target !== locale)
    .map(toOpenGraphLocale)

  return {
    locale: toOpenGraphLocale(locale),
    ...(alternateLocale.length > 0 ? { alternateLocale } : {}),
  }
}

function twitterCard(title: string, description: string, image: string): Metadata['twitter'] {
  return {
    card: 'summary_large_image',
    title,
    description,
    images: [image],
  }
}
