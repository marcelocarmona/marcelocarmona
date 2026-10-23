import { existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import projectsData from '../data/projectsData'
import sitemap from '../app/sitemap'
import robots from '../app/robots'
import { getHeaderNavLinks } from '../data/headerNavLinks'
import {
  getAboutPath,
  getBookPath,
  getContactPath,
  getGuidesPath,
  getPrivacyPath,
  getPostPath,
  getWatchPath,
} from '../lib/i18n/routes'
import generateRss from '../lib/generate-rss'
import { generateAiIndex, generateLlmsFullTxt, generateLlmsTxt } from '../lib/ai-discovery'
import { absoluteUrl, localizedMetadata, type PageReference } from '../lib/metadata'
import { getAllFilesFrontMatter } from '../lib/mdx'
import { hasMeaningfulUpdate } from '../lib/posts'
import { AI_DISCOVERY_PATHS, getPublicStaticPages } from '../lib/site-catalog'
import formatDate from '../lib/utils/formatDate'
import type { ContentFrontMatter } from '../types/content'

const siteUrl = 'https://marcelocarmona.com'

describe('localized route helpers', () => {
  it('keeps static page paths localized by locale', () => {
    expect(getAboutPath('en')).toBe('/about')
    expect(getBookPath('en')).toBe('/book')
    expect(getContactPath('en')).toBe('/contact')
    expect(getGuidesPath('en')).toBe('/guides')
    expect(getPrivacyPath('en')).toBe('/privacy')

    expect(getAboutPath('es')).toBe('/es/about')
    expect(getBookPath('es')).toBe('/es/book')
    expect(getContactPath('es')).toBe('/es/contact')
    expect(getGuidesPath('es')).toBe('/es/guides')
    expect(getPrivacyPath('es')).toBe('/es/privacy')
  })

  it('keeps Spanish article and watch URLs under /es', () => {
    expect(getPostPath('en', 'how-to-comment-in-react-jsx')).toBe('/how-to-comment-in-react-jsx')
    expect(getPostPath('es', 'comentarios-en-jsx')).toBe('/es/comentarios-en-jsx')

    expect(getWatchPath('en', 'creating-observable-from-scratch')).toBe(
      '/watch/creating-observable-from-scratch'
    )
    expect(getWatchPath('es', 'creando-observables-desde-cero')).toBe(
      '/es/watch/creando-observables-desde-cero'
    )
  })

  it('points Spanish navigation at Spanish routes', () => {
    expect(getHeaderNavLinks('es').map((link) => link.href)).toEqual([
      '/es/blog',
      '/es/guides',
      '/es/tags',
      '/es/book',
      '/es/about',
    ])
  })
})

describe('localized alternates', () => {
  const posts: ContentFrontMatter[] = [
    {
      title: 'How to comment in React JSX',
      locale: 'en',
      lang: 'en',
      slug: 'how-to-comment-in-react-jsx',
      fileName: 'how-to-comment-in-react-jsx.mdx',
      date: null,
      video: null,
      translationKey: 'react-jsx-comments',
    },
    {
      title: 'Comentarios en JSX',
      locale: 'es',
      lang: 'es',
      slug: 'comentarios-en-jsx',
      fileName: 'comentarios-en-jsx.md',
      date: null,
      video: null,
      translationKey: 'react-jsx-comments',
    },
  ]

  it('builds reciprocal hreflang paths with Spanish URLs under /es', () => {
    const metadata = localizedMetadata({
      kind: 'post',
      locale: 'en',
      post: posts[0],
      translations: [posts[1]],
    })

    expect(metadata.alternates?.languages).toEqual({
      'en-US': '/how-to-comment-in-react-jsx',
      'es-ES': '/es/comentarios-en-jsx',
      'x-default': '/how-to-comment-in-react-jsx',
    })
    expect(metadata.alternates?.types).toEqual({
      'text/markdown': '/how-to-comment-in-react-jsx.md',
    })
    expect(metadata.openGraph).toMatchObject({ locale: 'en_US', alternateLocale: ['es_ES'] })
  })

  it('omits hreflang languages for a post without translations', () => {
    const metadata = localizedMetadata({
      kind: 'post',
      locale: 'es',
      post: posts[1],
      translations: [],
    })

    expect(metadata.alternates?.languages).toBeUndefined()
    expect((metadata.openGraph as any).alternateLocale).toBeUndefined()
  })

  it('noindexes a post requested under the wrong locale and points to its canonical', () => {
    expect(
      localizedMetadata({ kind: 'post', locale: 'en', post: posts[1], translations: [] })
    ).toEqual({
      alternates: { canonical: '/es/comentarios-en-jsx' },
      robots: { index: false, follow: true },
    })
  })
})

describe('localized metadata for every page kind', () => {
  const pages: Array<[PageReference, string, string]> = [
    [{ kind: 'home', locale: 'en' }, '/', '/es'],
    [{ kind: 'blog', locale: 'en' }, '/blog', '/es/blog'],
    [{ kind: 'blog', locale: 'en', page: 2 }, '/blog/page/2', '/es/blog/page/2'],
    [{ kind: 'tags', locale: 'en' }, '/tags', '/es/tags'],
    [{ kind: 'about', locale: 'en' }, '/about', '/es/about'],
    [{ kind: 'book', locale: 'en' }, '/book', '/es/book'],
    [{ kind: 'guides', locale: 'en' }, '/guides', '/es/guides'],
    [{ kind: 'contact', locale: 'en' }, '/contact', '/es/contact'],
    [{ kind: 'privacy', locale: 'en' }, '/privacy', '/es/privacy'],
  ]

  describe.each(pages)('%o', (page, enPath, esPath) => {
    it.each(['en', 'es'] as const)('in %s', (locale) => {
      const metadata = localizedMetadata({ ...page, locale } as PageReference)
      const canonical = locale === 'en' ? enPath : esPath

      expect(metadata.alternates?.canonical).toBe(canonical)
      expect(metadata.alternates?.languages).toEqual({
        'en-US': enPath,
        'es-ES': esPath,
        'x-default': enPath,
      })
      expect(metadata.title).toBeTruthy()
      expect(metadata.description).toBeTruthy()
      expect(metadata.openGraph).toMatchObject({
        url: absoluteUrl(canonical),
        locale: locale === 'en' ? 'en_US' : 'es_ES',
        alternateLocale: [locale === 'en' ? 'es_ES' : 'en_US'],
        type: 'website',
      })
    })
  })

  it('uses an absolute home title so the layout template does not append the site name', () => {
    expect(localizedMetadata({ kind: 'home', locale: 'es' }).title).toHaveProperty('absolute')
    expect(localizedMetadata({ kind: 'home', locale: 'en' }).title).toHaveProperty('absolute')
  })

  it('links the locale feed from the home and blog index pages', () => {
    for (const kind of ['home', 'blog'] as const) {
      expect(localizedMetadata({ kind, locale: 'en' }).alternates?.types).toEqual({
        'application/rss+xml': '/feed.xml',
      })
      expect(localizedMetadata({ kind, locale: 'es' }).alternates?.types).toEqual({
        'application/rss+xml': '/es/feed.xml',
      })
    }
  })

  it('omits hreflang languages for a tag that exists in only one locale', () => {
    const metadata = localizedMetadata({
      kind: 'tag',
      locale: 'es',
      tag: 'rxjs',
      postCount: 2,
      availableLocales: ['es'],
    })

    expect(metadata.alternates?.canonical).toBe('/es/tags/rxjs')
    expect(metadata.alternates?.languages).toBeUndefined()
    expect((metadata.openGraph as any).alternateLocale).toBeUndefined()
  })

  it('links a tag available in both locales', () => {
    const metadata = localizedMetadata({
      kind: 'tag',
      locale: 'en',
      tag: 'react',
      postCount: 3,
      availableLocales: ['en', 'es'],
    })

    expect(metadata.alternates?.languages).toEqual({
      'en-US': '/tags/react',
      'es-ES': '/es/tags/react',
      'x-default': '/tags/react',
    })
  })
})

describe('sitemap', () => {
  it('does not keep a static public sitemap that can drift from dynamic routes', () => {
    expect(existsSync(path.join(process.cwd(), 'public', 'sitemap.xml'))).toBe(false)
  })

  it('includes localized Spanish routes and excludes migrated Spanish legacy URLs', async () => {
    const urls = (await sitemap()).map((entry) => entry.url)

    expect(urls).toContain(`${siteUrl}/es/about`)
    expect(urls).toContain(`${siteUrl}/es/book`)
    expect(urls).toContain(`${siteUrl}/contact`)
    expect(urls).toContain(`${siteUrl}/privacy`)
    expect(urls).toContain(`${siteUrl}/es/contact`)
    expect(urls).toContain(`${siteUrl}/es/privacy`)
    expect(urls).toContain(`${siteUrl}/es/guides`)
    expect(urls).toContain(`${siteUrl}/es/comentarios-en-jsx`)
    expect(urls).toContain(`${siteUrl}/es/watch/creando-observables-desde-cero`)

    expect(urls).not.toContain(`${siteUrl}/comentarios-en-jsx`)
    expect(urls).not.toContain(`${siteUrl}/watch/creando-observables-desde-cero`)
  })

  it('advertises AI discovery endpoints', async () => {
    const urls = (await sitemap()).map((entry) => entry.url)

    AI_DISCOVERY_PATHS.forEach((route) => {
      expect(urls).toContain(`${siteUrl}${route}`)
    })
  })

  it('uses the shared public route catalog for static pages', async () => {
    const urls = (await sitemap()).map((entry) => entry.url)

    getPublicStaticPages().forEach((page) => {
      expect(urls).toContain(page.url)
    })
  })
})

describe('robots', () => {
  it('allows search and agent crawlers explicitly while keeping sitemap discovery', () => {
    const robotsConfig = robots()
    const allowedUserAgents = robotsConfig.rules.map((rule) => rule.userAgent)

    expect(allowedUserAgents).toEqual([
      '*',
      'OAI-SearchBot',
      'GPTBot',
      'ChatGPT-User',
      'Claude-SearchBot',
      'Claude-User',
    ])
    expect(robotsConfig.sitemap).toBe(`${siteUrl}/sitemap.xml`)
    robotsConfig.rules.forEach((rule) => {
      expect(rule.allow).toBe('/')
    })
  })
})

describe('AI discovery', () => {
  it('builds a structured public index for agents', async () => {
    const index = await generateAiIndex()

    expect(index.site.discovery).toMatchObject({
      llmsTxtUrl: `${siteUrl}/llms.txt`,
      llmsFullTxtUrl: `${siteUrl}/llms-full.txt`,
      aiIndexUrl: `${siteUrl}/ai-index.json`,
      sitemapUrl: `${siteUrl}/sitemap.xml`,
      robotsUrl: `${siteUrl}/robots.txt`,
    })
    expect(index.pages.map((page) => page.url)).toEqual(
      expect.arrayContaining(getPublicStaticPages().map((page) => page.url))
    )
    expect(index.posts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'How to Comment in React, JSX, and TSX',
          locale: 'en',
          url: `${siteUrl}/how-to-comment-in-react-jsx`,
          translations: [
            expect.objectContaining({
              locale: 'es',
              url: `${siteUrl}/es/comentarios-en-jsx`,
            }),
          ],
        }),
        expect.objectContaining({
          title: '¿Cómo comentar en React, JSX y TSX?',
          locale: 'es',
          url: `${siteUrl}/es/comentarios-en-jsx`,
        }),
      ])
    )
    expect(index.tags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: 'react',
          locale: 'en',
          url: `${siteUrl}/tags/react`,
        }),
        expect.objectContaining({
          slug: 'react',
          locale: 'es',
          url: `${siteUrl}/es/tags/react`,
        }),
      ])
    )
  })

  it('builds compact and full llms text files', async () => {
    const llmsTxt = await generateLlmsTxt()
    const llmsFullTxt = await generateLlmsFullTxt()

    expect(llmsTxt).toContain('# Marcelo Carmona')
    expect(llmsTxt).toContain(`${siteUrl}/ai-index.json`)
    expect(llmsTxt).toContain(`${siteUrl}/llms-full.txt`)
    expect(llmsTxt).toContain('## Notes For Agents')

    expect(llmsFullTxt).toContain('## English Articles')
    expect(llmsFullTxt).toContain('## Spanish Articles')
    expect(llmsFullTxt).toContain(`${siteUrl}/es/comentarios-en-jsx`)
    expect(llmsFullTxt).toContain('## Agent Guidance')
  })
})

describe('projects data', () => {
  it('does not point project cards at missing internal routes', async () => {
    const posts = await getAllFilesFrontMatter('blog')
    const publicStaticPaths = getPublicStaticPages().map((page) => new URL(page.url).pathname)
    const validInternalProjectRoutes = new Set([
      ...publicStaticPaths,
      ...posts.map((post) => getPostPath(post)),
      ...posts.filter((post) => post.video?.watchPagePath).map((post) => getWatchPath(post)),
    ])

    projectsData
      .filter((project) => project.href?.startsWith('/'))
      .forEach((project) => {
        const href = project.href || ''
        expect(validInternalProjectRoutes.has(href), href).toBe(true)
      })
  })
})

describe('page metadata', () => {
  it('builds absolute Open Graph and Twitter metadata for static pages', () => {
    const metadata = localizedMetadata({ kind: 'about', locale: 'en' })
    const title = metadata.title as string
    const description = metadata.description as string

    expect(metadata.openGraph).toMatchObject({
      title,
      description,
      url: `${siteUrl}/about`,
      siteName: 'Marcelo Carmona',
      locale: 'en_US',
      alternateLocale: ['es_ES'],
      type: 'website',
    })
    const openGraph = metadata.openGraph as any
    expect(openGraph.images[0]).toMatchObject({
      url: `${siteUrl}/static/images/twitter-card.png`,
      width: 1200,
      height: 600,
      alt: 'Marcelo Carmona',
    })
    expect(metadata.twitter).toEqual({
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/static/images/twitter-card.png`],
    })
  })

  it('normalizes root and nested paths into absolute URLs', () => {
    expect(absoluteUrl('/')).toBe(siteUrl)
    expect(absoluteUrl('/es/about')).toBe(`${siteUrl}/es/about`)
    expect(absoluteUrl('https://example.com/image.png')).toBe('https://example.com/image.png')
  })

  it('omits alternate locales and hreflang for standalone single-locale pages', () => {
    const metadata = localizedMetadata({
      kind: 'standalone',
      title: 'Projects',
      description: 'Public projects and technical work by Marcelo Carmona.',
      path: '/projects',
    })

    expect(metadata.alternates).toEqual({ canonical: '/projects' })
    expect((metadata.openGraph as any).alternateLocale).toBeUndefined()
  })
})

describe('rss feeds', () => {
  it('keeps RSS ordering by publish date while exposing feed freshness', () => {
    const updatedPost: ContentFrontMatter = {
      title: 'Updated old post',
      slug: 'updated-old-post',
      locale: 'en',
      lang: 'en',
      fileName: 'updated-old-post.mdx',
      video: null,
      date: '2016-10-06T00:00:00.000Z',
      lastmod: '2026-04-26T00:00:00.000Z',
      summary: 'An older post with a new update.',
      tags: ['React'],
    }
    const newerPublishedPost: ContentFrontMatter = {
      title: 'Newer published post',
      slug: 'newer-published-post',
      locale: 'en',
      lang: 'en',
      fileName: 'newer-published-post.mdx',
      video: null,
      date: '2021-08-05T00:00:00.000Z',
      summary: 'A newer original publication date.',
      tags: ['Nextjs'],
    }

    const rss = generateRss([newerPublishedPost, updatedPost])

    expect(rss).toContain(
      `<lastBuildDate>${new Date(updatedPost.lastmod || '').toUTCString()}</lastBuildDate>`
    )
    expect(rss.indexOf('<title>Newer published post</title>')).toBeLessThan(
      rss.indexOf('<title>Updated old post</title>')
    )
    expect(rss).toContain(`<pubDate>${new Date(updatedPost.date || '').toUTCString()}</pubDate>`)
    expect(rss).toContain(`<atom:published>${updatedPost.date}</atom:published>`)
    expect(rss).toContain(`<atom:updated>${updatedPost.lastmod}</atom:updated>`)
  })
})

describe('post helpers', () => {
  it('detects meaningful updates without changing publish chronology', async () => {
    const posts = await getAllFilesFrontMatter('blog', { locale: 'en' })
    const newestPostIndex = posts.findIndex((post) => post.slug === 'istio-setup')
    const updatedOldPostIndex = posts.findIndex(
      (post) => post.slug === 'how-to-comment-in-react-jsx'
    )

    expect(newestPostIndex).toBeLessThan(updatedOldPostIndex)
    expect(hasMeaningfulUpdate(posts[updatedOldPostIndex])).toBe(true)
    expect(hasMeaningfulUpdate(posts[newestPostIndex])).toBe(false)
  })
})

describe('date formatting', () => {
  it('keeps date-only frontmatter stable across timezones', () => {
    expect(formatDate('2026-04-26', 'en')).toBe('April 26, 2026')
  })
})
