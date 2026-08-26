import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

import siteMetadata from '@/data/siteMetadata'
import { getTrustPageCopy, type TrustPageKind } from '@/data/trustPages'
import { normalizeContentPath } from '@/lib/content-negotiation'
import { getLanguageLabel, normalizeLocale, toHreflang } from '@/lib/i18n/config'
import {
  getBlogPagePath,
  getBlogPath,
  getBookPath,
  getContactPath,
  getGuidesPath,
  getHomePath,
  getLocaleFromPathname,
  getPrivacyPath,
  getPostPath,
  getTagPath,
  getTagsPath,
  getWatchPath,
} from '@/lib/i18n/routes'
import { absoluteUrl } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getTranslationsForPost } from '@/lib/post-relations'
import { POSTS_PER_PAGE } from '@/lib/posts'
import { getAiDiscoveryUrls, getPublicStaticPages } from '@/lib/site-catalog'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'
import type { ContentFrontMatter, Locale } from '@/types/content'

export interface MarkdownDocument {
  status: 200 | 404
  body: string
}

const root = process.cwd()

function link(label: string, url: string): string {
  return `[${label}](${url})`
}

function isoDate(value?: string | null): string | null {
  return value ? value.slice(0, 10) : null
}

function compact(lines: (string | null | undefined | false)[]): string {
  return lines.filter((line): line is string => typeof line === 'string').join('\n')
}

function discoveryFooter(): string[] {
  const discovery = getAiDiscoveryUrls()

  return [
    '---',
    '',
    `Site entrypoint for agents: ${link('llms.txt', discovery.llmsTxtUrl)} · ${link(
      'llms-full.txt',
      discovery.llmsFullTxtUrl
    )} · ${link('ai-index.json', discovery.aiIndexUrl)} · ${link(
      'sitemap.xml',
      discovery.sitemapUrl
    )}`,
    '',
    'Every HTML page on this site also serves this Markdown representation via',
    '`Accept: text/markdown`, or by appending `.md` to the URL.',
  ]
}

function isJsxBlockEnd(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.endsWith('/>') || /^<\/[A-Za-z]/.test(trimmed)
}

const MAX_ECHOED_PATH_LENGTH = 120

/**
 * The 404 body echoes the requested path so an agent can see what it asked for.
 * That path is attacker controlled, so strip anything that could break out of
 * the inline code span and turn the echo into injected instructions.
 */
export function describeRequestedPath(pathname: string): string {
  const withoutControlChars = normalizeContentPath(pathname).replace(/[\u0000-\u001f\u007f]/g, ' ')
  const withoutFences = withoutControlChars.replace(/`/g, '')
  const collapsed = withoutFences.replace(/\s+/g, ' ').trim()

  if (collapsed.length <= MAX_ECHOED_PATH_LENGTH) {
    return collapsed || '/'
  }

  return `${collapsed.slice(0, MAX_ECHOED_PATH_LENGTH)}…`
}

function renderJsxBlock(blockLines: string[]): string {
  const block = blockLines.join(' ')
  const srcMatch = block.match(/src=["']([^"']+)["']/)

  if (srcMatch) {
    const altMatch = block.match(/alt=["']([^"']*)["']/)
    return `![${altMatch ? altMatch[1] : ''}](${srcMatch[1]})`
  }

  const nameMatch = block.match(/^<([A-Za-z][\w.]*)/)
  return nameMatch ? `_[Interactive component: ${nameMatch[1]} — see the HTML page]_` : ''
}

/**
 * Turns MDX source into plain Markdown: drops `import`/`export` statements and
 * top-level JSX blocks, keeping fenced code blocks byte for byte.
 */
export function mdxToMarkdown(source: string): string {
  const lines = source.split('\n')
  const output: string[] = []
  let fenceMarker: string | null = null
  let jsxBlock: string[] | null = null

  lines.forEach((line) => {
    const fenceMatch = line.match(/^\s*(```|~~~)/)

    if (fenceMatch && !jsxBlock) {
      if (fenceMarker === null) {
        fenceMarker = fenceMatch[1]
      } else if (fenceMatch[1] === fenceMarker) {
        fenceMarker = null
      }
      output.push(line)
      return
    }

    if (fenceMarker !== null) {
      output.push(line)
      return
    }

    if (jsxBlock) {
      jsxBlock.push(line)
      if (isJsxBlockEnd(line)) {
        output.push(renderJsxBlock(jsxBlock))
        jsxBlock = null
      }
      return
    }

    if (/^(import|export)\s/.test(line)) {
      return
    }

    if (/^<[A-Za-z]/.test(line)) {
      jsxBlock = [line]
      if (isJsxBlockEnd(line)) {
        output.push(renderJsxBlock(jsxBlock))
        jsxBlock = null
      }
      return
    }

    output.push(line)
  })

  return output
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function readPostSource(post: ContentFrontMatter): string | null {
  const filePath = path.join(root, 'data', 'blog', post.fileName)
  if (!fs.existsSync(filePath)) {
    return null
  }

  return matter(fs.readFileSync(filePath, 'utf8')).content
}

function renderPostMarkdown(posts: ContentFrontMatter[], post: ContentFrontMatter): string | null {
  const source = readPostSource(post)
  if (source === null) {
    return null
  }

  const canonical = absoluteUrl(getPostPath(post))
  const published = isoDate(post.date)
  const updated = isoDate(post.lastmod)
  const translations = getTranslationsForPost(posts, post)

  return compact([
    `# ${post.title || post.slug}`,
    '',
    post.summary ? `> ${post.summary}` : null,
    post.summary ? '' : null,
    `- Canonical URL: ${canonical}`,
    `- Language: ${getLanguageLabel(post.locale)} (${toHreflang(post.locale)})`,
    published ? `- Published: ${published}` : null,
    updated && updated !== published ? `- Updated: ${updated}` : null,
    post.tags?.length ? `- Tags: ${post.tags.join(', ')}` : null,
    post.video ? `- Video: ${absoluteUrl(post.video.watchPagePath)}` : null,
    translations.length
      ? `- Other languages: ${translations
          .map((translation) =>
            link(getLanguageLabel(translation.locale), absoluteUrl(getPostPath(translation)))
          )
          .join(', ')}`
      : null,
    '',
    '---',
    '',
    mdxToMarkdown(source),
    '',
    ...discoveryFooter(),
    '',
  ])
}

function renderPostListEntry(post: ContentFrontMatter): string {
  const published = isoDate(post.date)
  const summary = post.summary ? ` — ${post.summary}` : ''
  const date = published ? ` (${published})` : ''

  return `- ${link(post.title || post.slug, absoluteUrl(getPostPath(post)))}${date}${summary}`
}

function renderListingMarkdown({
  title,
  intro,
  canonicalPath,
  posts,
  extraLines = [],
}: {
  title: string
  intro: string
  canonicalPath: string
  posts: ContentFrontMatter[]
  extraLines?: string[]
}): string {
  return compact([
    `# ${title}`,
    '',
    `> ${intro}`,
    '',
    `- Canonical URL: ${absoluteUrl(canonicalPath)}`,
    ...extraLines,
    '',
    '## Articles',
    '',
    ...(posts.length ? posts.map(renderPostListEntry) : ['- No articles published yet.']),
    '',
    ...discoveryFooter(),
    '',
  ])
}

function renderStaticPageMarkdown(page: {
  title: string
  description: string
  path: string
  locale: string
}): string {
  return compact([
    `# ${page.title}`,
    '',
    `> ${page.description}`,
    '',
    `- Canonical URL: ${absoluteUrl(page.path)}`,
    `- Language: ${getLanguageLabel(page.locale)} (${toHreflang(page.locale)})`,
    '',
    'This page is primarily interactive. Fetch the HTML representation for the full',
    'experience, or use the site indexes below for machine-readable content.',
    '',
    ...discoveryFooter(),
    '',
  ])
}

function renderTrustPageMarkdown(kind: TrustPageKind, locale: Locale): string {
  const page = getTrustPageCopy(kind, locale)
  const canonicalPath = kind === 'contact' ? getContactPath(locale) : getPrivacyPath(locale)
  const actionLines =
    kind === 'contact'
      ? [
          `- Email: ${link(siteMetadata.email, `mailto:${siteMetadata.email}`)}`,
          `- Book a call: ${link(absoluteUrl(getBookPath(locale)), absoluteUrl(getBookPath(locale)))}`,
        ]
      : [
          `- Email: ${link(siteMetadata.email, `mailto:${siteMetadata.email}`)}`,
          `- Contact page: ${link(
            absoluteUrl(getContactPath(locale)),
            absoluteUrl(getContactPath(locale))
          )}`,
        ]

  return compact([
    `# ${page.title}`,
    '',
    `> ${page.intro}`,
    '',
    `- Canonical URL: ${absoluteUrl(canonicalPath)}`,
    `- Language: ${getLanguageLabel(locale)} (${toHreflang(locale)})`,
    '',
    ...page.sections.flatMap((section) => [
      `## ${section.title}`,
      '',
      ...section.paragraphs.flatMap((paragraph) => [paragraph, '']),
    ]),
    '## Contact details',
    '',
    ...actionLines,
    '',
    ...discoveryFooter(),
    '',
  ])
}

export function renderNotFoundMarkdown(pathname: string): string {
  const discovery = getAiDiscoveryUrls()
  const requested = describeRequestedPath(pathname)

  return compact([
    '# 404 Not Found',
    '',
    `> \`${requested}\` does not exist on ${siteMetadata.siteUrl}. Nothing was moved or hidden — this path was never published.`,
    '',
    '## Where to look next',
    '',
    `- ${link('llms.txt', discovery.llmsTxtUrl)} — compact agent entrypoint with when-to-use guidance.`,
    `- ${link('llms-full.txt', discovery.llmsFullTxtUrl)} — every public page, article, tag, and feed in Markdown.`,
    `- ${link('ai-index.json', discovery.aiIndexUrl)} — the same catalog as structured JSON.`,
    `- ${link('sitemap.xml', discovery.sitemapUrl)} — complete URL list for crawling.`,
    `- ${link('robots.txt', discovery.robotsUrl)} — crawler policy.`,
    '',
    '## Main sections',
    '',
    `- ${link('Home (English)', absoluteUrl(getHomePath('en')))}`,
    `- ${link('Inicio (Español)', absoluteUrl(getHomePath('es')))}`,
    `- ${link('Blog index', absoluteUrl(getBlogPath('en')))}`,
    `- ${link('Guides', absoluteUrl(getGuidesPath('en')))}`,
    `- ${link('Tags', absoluteUrl(getTagsPath('en')))}`,
    '',
    '## Recovering from this error',
    '',
    '- Article URLs are flat: `/{slug}` in English and `/es/{slug}` in Spanish. Do not guess `/blog/{slug}`.',
    '- Resolve slugs from `llms.txt`, `ai-index.json`, or `sitemap.xml` instead of constructing them.',
    '- Append `.md` to any published URL, or send `Accept: text/markdown`, to get the Markdown representation.',
    '',
  ])
}

function matchBlogPage(pathname: string, locale: Locale): number | null {
  if (pathname === getBlogPath(locale)) {
    return 1
  }

  const prefix = `${getBlogPath(locale)}/page/`
  if (!pathname.startsWith(prefix)) {
    return null
  }

  const parsed = Number.parseInt(pathname.slice(prefix.length), 10)
  return Number.isNaN(parsed) || parsed < 1 ? null : parsed
}

async function buildHomeDocument(locale: Locale): Promise<MarkdownDocument> {
  const posts = await getAllFilesFrontMatter('blog', { locale })
  const isSpanish = locale === 'es'

  return {
    status: 200,
    body: renderListingMarkdown({
      title: siteMetadata.title,
      intro: siteMetadata.description,
      canonicalPath: getHomePath(locale),
      posts: posts.slice(0, POSTS_PER_PAGE),
      extraLines: [
        `- Language: ${getLanguageLabel(locale)} (${toHreflang(locale)})`,
        `- ${link(isSpanish ? 'Todos los articulos' : 'All articles', absoluteUrl(getBlogPath(locale)))}`,
        `- ${link(isSpanish ? 'Guias' : 'Guides', absoluteUrl(getGuidesPath(locale)))}`,
        `- ${link(isSpanish ? 'Etiquetas' : 'Tags', absoluteUrl(getTagsPath(locale)))}`,
      ],
    }),
  }
}

async function buildBlogDocument(locale: Locale, page: number): Promise<MarkdownDocument | null> {
  const posts = await getAllFilesFrontMatter('blog', { locale })
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))

  if (page > totalPages) {
    return null
  }

  const pagePosts = posts.slice(POSTS_PER_PAGE * (page - 1), POSTS_PER_PAGE * page)
  const extraLines = [
    `- Language: ${getLanguageLabel(locale)} (${toHreflang(locale)})`,
    `- Page ${page} of ${totalPages}`,
    page > 1 ? `- Previous page: ${absoluteUrl(getBlogPagePath(locale, page - 1))}` : null,
    page < totalPages ? `- Next page: ${absoluteUrl(getBlogPagePath(locale, page + 1))}` : null,
  ].filter((line): line is string => line !== null)

  return {
    status: 200,
    body: renderListingMarkdown({
      title: locale === 'es' ? 'Todos los articulos' : 'All Posts',
      intro: siteMetadata.description,
      canonicalPath: getBlogPagePath(locale, page),
      posts: pagePosts,
      extraLines,
    }),
  }
}

async function buildTagsIndexDocument(locale: Locale): Promise<MarkdownDocument> {
  const tags = await getAllTags('blog', { locale })
  const entries = Object.entries(tags).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

  return {
    status: 200,
    body: compact([
      `# ${locale === 'es' ? 'Etiquetas' : 'Tags'}`,
      '',
      `> ${locale === 'es' ? 'Explora articulos por etiqueta.' : 'Browse articles by topic tag.'}`,
      '',
      `- Canonical URL: ${absoluteUrl(getTagsPath(locale))}`,
      `- Language: ${getLanguageLabel(locale)} (${toHreflang(locale)})`,
      '',
      '## Topics',
      '',
      ...(entries.length
        ? entries.map(
            ([tag, count]) => `- ${link(tag, absoluteUrl(getTagPath(locale, tag)))} (${count})`
          )
        : ['- No tags published yet.']),
      '',
      ...discoveryFooter(),
      '',
    ]),
  }
}

async function buildTagDocument(locale: Locale, tag: string): Promise<MarkdownDocument | null> {
  const posts = await getAllFilesFrontMatter('blog', { locale })
  const tagged = posts.filter((post) =>
    (post.tags || []).map((postTag) => kebabCase(postTag)).includes(tag)
  )

  if (!tagged.length) {
    return null
  }

  return {
    status: 200,
    body: renderListingMarkdown({
      title: tag,
      intro: `Articles tagged ${tag} by ${siteMetadata.author}.`,
      canonicalPath: getTagPath(locale, tag),
      posts: tagged,
      extraLines: [
        `- Language: ${getLanguageLabel(locale)} (${toHreflang(locale)})`,
        `- RSS: ${absoluteUrl(`${getTagPath(locale, tag)}/feed.xml`)}`,
      ],
    }),
  }
}

async function buildGuidesDocument(locale: Locale): Promise<MarkdownDocument> {
  const posts = await getAllFilesFrontMatter('blog', { locale })

  return {
    status: 200,
    body: renderListingMarkdown({
      title: locale === 'es' ? 'Guias' : 'Guides',
      intro:
        locale === 'es'
          ? 'Rutas de aprendizaje agrupadas por tema.'
          : 'Clustered learning paths by topic.',
      canonicalPath: getGuidesPath(locale),
      posts,
      extraLines: [`- Language: ${getLanguageLabel(locale)} (${toHreflang(locale)})`],
    }),
  }
}

async function buildWatchDocument(locale: Locale, slug: string): Promise<MarkdownDocument | null> {
  const posts = await getAllFilesFrontMatter('blog', { locale })
  const post = posts.find((candidate) => candidate.slug === slug && candidate.video)

  if (!post || !post.video) {
    return null
  }

  return {
    status: 200,
    body: compact([
      `# ${post.video.title}`,
      '',
      post.summary ? `> ${post.summary}` : null,
      post.summary ? '' : null,
      `- Canonical URL: ${absoluteUrl(getWatchPath(post))}`,
      `- Article: ${absoluteUrl(getPostPath(post))}`,
      `- Video: ${post.video.watchUrl}`,
      post.video.uploadDate ? `- Uploaded: ${isoDate(post.video.uploadDate)}` : null,
      '',
      ...discoveryFooter(),
      '',
    ]),
  }
}

async function buildPostDocument(locale: Locale, slug: string): Promise<MarkdownDocument | null> {
  const posts = await getAllFilesFrontMatter('blog')
  const post = posts.find((candidate) => candidate.slug === slug && candidate.locale === locale)

  if (!post) {
    return null
  }

  const body = renderPostMarkdown(posts, post)
  return body === null ? null : { status: 200, body }
}

/**
 * Resolves the Markdown representation of a public HTML route.
 *
 * Unknown paths return a 404 document whose body tells the agent where to look
 * next, so a wrong guess still ends in a usable next step.
 */
export async function getMarkdownDocument(pathname: string): Promise<MarkdownDocument> {
  const normalizedPath = normalizeContentPath(pathname)
  const locale = getLocaleFromPathname(normalizedPath)
  const notFound: MarkdownDocument = {
    status: 404,
    body: renderNotFoundMarkdown(normalizedPath),
  }

  if (normalizedPath === getHomePath(locale)) {
    return buildHomeDocument(locale)
  }

  const blogPage = matchBlogPage(normalizedPath, locale)
  if (blogPage !== null) {
    return (await buildBlogDocument(locale, blogPage)) || notFound
  }

  if (normalizedPath === getTagsPath(locale)) {
    return buildTagsIndexDocument(locale)
  }

  if (normalizedPath.startsWith(`${getTagsPath(locale)}/`)) {
    const tag = normalizedPath.slice(getTagsPath(locale).length + 1)
    return (tag.includes('/') ? null : await buildTagDocument(locale, tag)) || notFound
  }

  if (normalizedPath === getGuidesPath(locale)) {
    return buildGuidesDocument(locale)
  }

  if (normalizedPath === getContactPath(locale)) {
    return { status: 200, body: renderTrustPageMarkdown('contact', normalizeLocale(locale)) }
  }

  if (normalizedPath === getPrivacyPath(locale)) {
    return { status: 200, body: renderTrustPageMarkdown('privacy', normalizeLocale(locale)) }
  }

  const watchPrefix = getWatchPath(locale, '')
  if (normalizedPath.startsWith(watchPrefix)) {
    const slug = normalizedPath.slice(watchPrefix.length)
    return (await buildWatchDocument(locale, slug)) || notFound
  }

  const staticPage = getPublicStaticPages().find(
    (page) => normalizeContentPath(page.path) === normalizedPath
  )
  if (staticPage) {
    return { status: 200, body: renderStaticPageMarkdown(staticPage) }
  }

  const slug =
    locale === 'es' ? normalizedPath.replace(/^\/es\//, '') : normalizedPath.replace(/^\//, '')
  if (!slug || slug.includes('/')) {
    return notFound
  }

  return (await buildPostDocument(normalizeLocale(locale), slug)) || notFound
}
