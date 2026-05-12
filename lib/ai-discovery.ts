import siteMetadata from '@/data/siteMetadata'
import { getLanguageLabel, toHreflang } from '@/lib/i18n/config'
import { getPostPath, getTagPath } from '@/lib/i18n/routes'
import { absoluteUrl } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getTranslationsForPost } from '@/lib/post-relations'
import {
  getAiDiscoveryUrls,
  getPublicFeeds,
  getPublicLanguages,
  getPublicStaticPages,
} from '@/lib/site-catalog'
import kebabCase from '@/lib/utils/kebabCase'
import type { ContentFrontMatter, Locale } from '@/types/content'

interface AiPostEntry {
  [key: string]: any
  type: 'article'
  title: string
  slug: string
  locale: Locale
  language: string
  hrefLang: string
  url: string
  canonicalUrl: string
  summary: string
  tags: string[]
  datePublished: string | null
  dateModified: string | null
  translationKey: string | null
  translations: Array<Record<string, string | undefined>>
  sourceUrl: string | null
  video?: {
    title: string
    url: string
    embedUrl: string
    watchUrl: string
    thumbnailUrl: string
    uploadDate: string | null
  }
}

interface TagIndexEntry {
  name: string
  slug: string
  locale: Locale
  hrefLang: string
  url: string
  count: number
}

function compactText(value = ''): string {
  return String(value).replace(/\s+/g, ' ').trim()
}

function markdownText(value = ''): string {
  return compactText(value).replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]')
}

function markdownLink(label: string, url: string): string {
  return `[${markdownText(label)}](${url})`
}

function getPostUpdatedDate(post: ContentFrontMatter): string | null {
  return post.lastmod || post.date || null
}

function comparePostsByPublishedDate(a: ContentFrontMatter, b: ContentFrontMatter): number {
  return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
}

function toAbsoluteMaybe(pathOrUrl?: string | null): string | null {
  return pathOrUrl ? absoluteUrl(pathOrUrl) : null
}

function getLatestContentDate(posts: ContentFrontMatter[]): string | null {
  const latest = posts.reduce<Date | null>((latestDate, post) => {
    const date = getPostUpdatedDate(post)
    if (!date) {
      return latestDate
    }

    const time = new Date(date).getTime()
    if (!Number.isFinite(time)) {
      return latestDate
    }

    return !latestDate || time > latestDate.getTime() ? new Date(time) : latestDate
  }, null)

  return latest?.toISOString() || null
}

function buildTagIndex(posts: ContentFrontMatter[]): TagIndexEntry[] {
  const tagMap = new Map<string, TagIndexEntry>()

  posts.forEach((post) => {
    const tags = post.tags || []

    tags.forEach((tag) => {
      const slug = kebabCase(tag)
      const key = `${post.locale}:${slug}`
      const currentTag = tagMap.get(key) || {
        name: tag,
        slug,
        locale: post.locale,
        hrefLang: toHreflang(post.locale),
        url: absoluteUrl(getTagPath(post.locale, slug)),
        count: 0,
      }

      currentTag.count += 1
      tagMap.set(key, currentTag)
    })
  })

  return Array.from(tagMap.values()).sort((a, b) => {
    if (a.locale !== b.locale) {
      return a.locale.localeCompare(b.locale)
    }

    return a.slug.localeCompare(b.slug)
  })
}

function buildPostEntry(posts: ContentFrontMatter[], post: ContentFrontMatter): AiPostEntry {
  const sitePath = getPostPath(post)
  const translations = getTranslationsForPost(posts, post).map((translation) => ({
    title: translation.title,
    locale: translation.locale,
    hrefLang: toHreflang(translation.locale),
    url: absoluteUrl(getPostPath(translation)),
  }))

  return {
    type: 'article',
    title: post.title || post.slug,
    slug: post.slug,
    locale: post.locale,
    language: getLanguageLabel(post.locale),
    hrefLang: toHreflang(post.locale),
    url: absoluteUrl(sitePath),
    canonicalUrl: toAbsoluteMaybe(post.canonicalUrl) || absoluteUrl(sitePath),
    summary: compactText(post.summary || ''),
    tags: post.tags || [],
    datePublished: post.date,
    dateModified: getPostUpdatedDate(post),
    translationKey: post.translationKey || null,
    translations,
    sourceUrl: post.fileName
      ? `${siteMetadata.siteRepo}/blob/master/data/blog/${post.fileName}`
      : null,
    ...(post.video
      ? {
          video: {
            title: post.video.title,
            url: absoluteUrl(post.video.watchPagePath),
            embedUrl: post.video.embedUrl,
            watchUrl: post.video.watchUrl,
            thumbnailUrl: post.video.thumbnailUrl,
            uploadDate: post.video.uploadDate,
          },
        }
      : {}),
  }
}

export async function generateAiIndex() {
  const posts = await getAllFilesFrontMatter('blog')
  const sortedPosts = [...posts].sort(comparePostsByPublishedDate)
  const postEntries = sortedPosts.map((post) => buildPostEntry(posts, post))
  const videoEntries = postEntries
    .filter((post): post is AiPostEntry & { video: NonNullable<AiPostEntry['video']> } =>
      Boolean(post.video)
    )
    .map((post) => ({
      articleTitle: post.title,
      articleUrl: post.url,
      locale: post.locale,
      ...post.video,
    }))

  return {
    version: 1,
    updatedAt: getLatestContentDate(posts),
    site: {
      name: siteMetadata.title,
      description: siteMetadata.description,
      url: siteMetadata.siteUrl,
      author: {
        name: siteMetadata.author,
        email: siteMetadata.email,
        github: siteMetadata.github,
        linkedin: siteMetadata.linkedin,
      },
      repository: siteMetadata.siteRepo,
      languages: getPublicLanguages(),
      discovery: getAiDiscoveryUrls(),
    },
    feeds: getPublicFeeds(),
    pages: getPublicStaticPages(),
    posts: postEntries,
    videos: videoEntries,
    tags: buildTagIndex(posts),
  }
}

function formatPostLine(post: AiPostEntry): string {
  const summary = post.summary ? `: ${post.summary}` : ''
  const updated = post.dateModified ? ` Updated ${post.dateModified.slice(0, 10)}.` : ''
  return `- ${markdownLink(post.title, post.url)}${summary}${updated}`
}

function formatPageLine(page: { title: string; url: string; description: string }): string {
  return `- ${markdownLink(page.title, page.url)}: ${page.description}`
}

export async function generateLlmsTxt() {
  const index = await generateAiIndex()
  const latestPosts = index.posts.slice(0, 8)

  return [
    `# ${siteMetadata.title}`,
    '',
    `> ${siteMetadata.description}`,
    '',
    `${siteMetadata.title} is the personal technical site of ${siteMetadata.author}. It publishes articles and guides about React, Next.js, frontend performance, software architecture, and platform engineering in English and Spanish.`,
    '',
    'Use canonical URLs when citing this site. Prefer the JSON index for structured ingestion and the full Markdown index for quick human-readable exploration.',
    '',
    '## Core Resources',
    '',
    `- ${markdownLink('Structured AI index', index.site.discovery.aiIndexUrl)}: JSON index of pages, articles, tags, feeds, translations, and video metadata.`,
    `- ${markdownLink('Full LLM index', index.site.discovery.llmsFullTxtUrl)}: Expanded Markdown index of the same public content.`,
    `- ${markdownLink('Sitemap', index.site.discovery.sitemapUrl)}: Complete URL discovery for crawlers.`,
    `- ${markdownLink('Robots.txt', index.site.discovery.robotsUrl)}: Crawler access policy.`,
    '',
    '## Site Sections',
    '',
    ...index.pages.map(formatPageLine),
    '',
    '## Feeds',
    '',
    ...index.feeds.map((feed) => `- ${markdownLink(feed.title, feed.url)}: ${feed.type}`),
    '',
    '## Recent Articles',
    '',
    ...latestPosts.map(formatPostLine),
    '',
    '## Notes For Agents',
    '',
    '- Public article pages are server-rendered and include canonical metadata, language alternates, JSON-LD, RSS, and sitemap coverage.',
    '- The booking page uses a third-party Cal.com embed and also links to the hosted Cal.com page.',
    '- Newsletter endpoints should be treated as write actions and require user intent before submitting data.',
    '',
  ].join('\n')
}

export async function generateLlmsFullTxt() {
  const index = await generateAiIndex()
  const postsByLocale = index.posts.reduce<Record<Locale, AiPostEntry[]>>(
    (acc, post) => {
      acc[post.locale] = acc[post.locale] || []
      acc[post.locale].push(post)
      return acc
    },
    { en: [], es: [] }
  )

  const englishPosts = postsByLocale.en || []
  const spanishPosts = postsByLocale.es || []

  return [
    `# ${siteMetadata.title}`,
    '',
    `> ${siteMetadata.description}`,
    '',
    '## Site',
    '',
    `- Name: ${siteMetadata.title}`,
    `- Author: ${siteMetadata.author}`,
    `- URL: ${siteMetadata.siteUrl}`,
    `- Repository: ${siteMetadata.siteRepo}`,
    `- Updated: ${index.updatedAt || 'Unknown'}`,
    '',
    '## Discovery',
    '',
    `- ${markdownLink('llms.txt', index.site.discovery.llmsTxtUrl)}: Compact LLM entrypoint.`,
    `- ${markdownLink('llms-full.txt', index.site.discovery.llmsFullTxtUrl)}: Expanded Markdown index.`,
    `- ${markdownLink('ai-index.json', index.site.discovery.aiIndexUrl)}: Structured JSON index.`,
    `- ${markdownLink('sitemap.xml', index.site.discovery.sitemapUrl)}: Crawler sitemap.`,
    `- ${markdownLink('robots.txt', index.site.discovery.robotsUrl)}: Crawler policy.`,
    '',
    '## Languages',
    '',
    ...index.site.languages.map(
      (language) =>
        `- ${language.label} (${language.hrefLang}): ${markdownLink(language.homeUrl, language.homeUrl)}`
    ),
    '',
    '## Pages',
    '',
    ...index.pages.map(formatPageLine),
    '',
    '## Feeds',
    '',
    ...index.feeds.map((feed) => `- ${markdownLink(feed.title, feed.url)}: ${feed.type}`),
    '',
    '## English Articles',
    '',
    ...englishPosts.map(formatPostLine),
    '',
    '## Spanish Articles',
    '',
    ...spanishPosts.map(formatPostLine),
    '',
    '## Videos',
    '',
    ...(index.videos.length
      ? index.videos.map(
          (video) =>
            `- ${markdownLink(video.title, video.url)}: Related article ${markdownLink(
              video.articleTitle,
              video.articleUrl
            )}.`
        )
      : ['- No dedicated video pages are currently published.']),
    '',
    '## Tags',
    '',
    ...index.tags.map(
      (tag) => `- ${markdownLink(tag.name, tag.url)} (${tag.locale}): ${tag.count}`
    ),
    '',
    '## Agent Guidance',
    '',
    '- Prefer article canonical URLs over alternate route guesses.',
    '- Use the language and hrefLang fields when matching English and Spanish content.',
    '- Treat forms, booking, and newsletter submissions as actions that need explicit user approval.',
    '- Do not infer private or unpublished content from repository paths; only public URLs in this index are intended for public use.',
    '',
  ].join('\n')
}
