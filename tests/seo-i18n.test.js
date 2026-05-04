import { describe, expect, it } from 'vitest'

import projectsData from '../data/projectsData'
import sitemap from '../app/sitemap'
import { getHeaderNavLinks } from '../data/headerNavLinks'
import {
  getAboutPath,
  getBookPath,
  getGuidesPath,
  getPostPath,
  getWatchPath,
} from '../lib/i18n/routes'
import { getAllFilesFrontMatter } from '../lib/mdx'
import { buildLanguageAlternates } from '../lib/post-relations'

const siteUrl = 'https://marcelocarmona.com'

describe('localized route helpers', () => {
  it('keeps static page paths localized by locale', () => {
    expect(getAboutPath('en')).toBe('/about')
    expect(getBookPath('en')).toBe('/book')
    expect(getGuidesPath('en')).toBe('/guides')

    expect(getAboutPath('es')).toBe('/es/about')
    expect(getBookPath('es')).toBe('/es/book')
    expect(getGuidesPath('es')).toBe('/es/guides')
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
  it('builds reciprocal hreflang paths with Spanish URLs under /es', () => {
    const posts = [
      {
        locale: 'en',
        slug: 'how-to-comment-in-react-jsx',
        translationKey: 'react-jsx-comments',
      },
      {
        locale: 'es',
        slug: 'comentarios-en-jsx',
        translationKey: 'react-jsx-comments',
      },
    ]

    expect(buildLanguageAlternates(posts, posts[0])).toEqual({
      'en-US': '/how-to-comment-in-react-jsx',
      'es-ES': '/es/comentarios-en-jsx',
      'x-default': '/how-to-comment-in-react-jsx',
    })
  })
})

describe('sitemap', () => {
  it('includes localized Spanish routes and excludes migrated Spanish legacy URLs', async () => {
    const urls = (await sitemap()).map((entry) => entry.url)

    expect(urls).toContain(`${siteUrl}/es/about`)
    expect(urls).toContain(`${siteUrl}/es/book`)
    expect(urls).toContain(`${siteUrl}/es/guides`)
    expect(urls).toContain(`${siteUrl}/es/comentarios-en-jsx`)
    expect(urls).toContain(`${siteUrl}/es/watch/creando-observables-desde-cero`)

    expect(urls).not.toContain(`${siteUrl}/comentarios-en-jsx`)
    expect(urls).not.toContain(`${siteUrl}/watch/creando-observables-desde-cero`)
  })
})

describe('projects data', () => {
  it('does not point project cards at missing internal routes', async () => {
    const posts = await getAllFilesFrontMatter('blog')
    const validInternalProjectRoutes = new Set([
      '/',
      '/about',
      '/blog',
      '/book',
      '/guides',
      '/projects',
      '/tags',
      '/es',
      '/es/about',
      '/es/blog',
      '/es/book',
      '/es/guides',
      '/es/tags',
      ...posts.map((post) => getPostPath(post)),
      ...posts.filter((post) => post.video?.watchPagePath).map((post) => getWatchPath(post)),
    ])

    projectsData
      .filter((project) => project.href?.startsWith('/'))
      .forEach((project) => {
        expect(validInternalProjectRoutes.has(project.href), project.href).toBe(true)
      })
  })
})
