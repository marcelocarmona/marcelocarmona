import siteMetadata from '@/data/siteMetadata'
import { getTrustPageCopy } from '@/data/trustPages'
import { getLanguageLabel, toHreflang } from '@/lib/i18n/config'
import {
  getAboutPath,
  getBlogPath,
  getBookPath,
  getContactPath,
  getFeedPath,
  getGuidesPath,
  getHomePath,
  getPrivacyPath,
  getTagsPath,
} from '@/lib/i18n/routes'
import { absoluteUrl } from '@/lib/metadata'

export const AI_DISCOVERY_PATHS = ['/llms.txt', '/llms-full.txt', '/ai-index.json']

export const PUBLIC_STATIC_PAGES = [
  {
    title: 'Home',
    locale: 'en',
    path: getHomePath('en'),
    description: siteMetadata.description,
  },
  {
    title: 'Inicio',
    locale: 'es',
    path: getHomePath('es'),
    description: 'Articulos en espanol sobre React, Next.js, rendimiento web y arquitectura.',
  },
  {
    title: 'Blog',
    locale: 'en',
    path: getBlogPath('en'),
    description: 'English technical articles by Marcelo Carmona.',
  },
  {
    title: 'Blog',
    locale: 'es',
    path: getBlogPath('es'),
    description: 'Articulos tecnicos en espanol por Marcelo Carmona.',
  },
  {
    title: 'Guides',
    locale: 'en',
    path: getGuidesPath('en'),
    description: 'Clustered learning paths by topic.',
  },
  {
    title: 'Guias',
    locale: 'es',
    path: getGuidesPath('es'),
    description: 'Rutas de aprendizaje agrupadas por tema.',
  },
  {
    title: 'Tags',
    locale: 'en',
    path: getTagsPath('en'),
    description: 'Browse English articles by topic tag.',
  },
  {
    title: 'Etiquetas',
    locale: 'es',
    path: getTagsPath('es'),
    description: 'Explora articulos en espanol por etiqueta.',
  },
  {
    title: 'Book a Call',
    locale: 'en',
    path: getBookPath('en'),
    description: 'Schedule a call with Marcelo Carmona.',
  },
  {
    title: 'Reservar llamada',
    locale: 'es',
    path: getBookPath('es'),
    description: 'Reserva una llamada con Marcelo Carmona.',
  },
  {
    title: 'About',
    locale: 'en',
    path: getAboutPath('en'),
    description: 'Professional profile for Marcelo Carmona.',
  },
  {
    title: 'Acerca',
    locale: 'es',
    path: getAboutPath('es'),
    description: 'Perfil profesional de Marcelo Carmona.',
  },
  {
    title: getTrustPageCopy('contact', 'en').title,
    locale: 'en',
    path: getContactPath('en'),
    description: getTrustPageCopy('contact', 'en').description,
  },
  {
    title: getTrustPageCopy('contact', 'es').title,
    locale: 'es',
    path: getContactPath('es'),
    description: getTrustPageCopy('contact', 'es').description,
  },
  {
    title: getTrustPageCopy('privacy', 'en').title,
    locale: 'en',
    path: getPrivacyPath('en'),
    description: getTrustPageCopy('privacy', 'en').description,
  },
  {
    title: getTrustPageCopy('privacy', 'es').title,
    locale: 'es',
    path: getPrivacyPath('es'),
    description: getTrustPageCopy('privacy', 'es').description,
  },
  {
    title: 'Projects',
    locale: 'en',
    path: '/projects',
    description: 'Public projects and technical work by Marcelo Carmona.',
  },
  {
    title: 'SF Crash Map',
    locale: 'en',
    path: '/sf-crash-map',
    description: 'Explore recent DataSF injury crash records across San Francisco neighborhoods.',
  },
]

export function getPublicStaticPages() {
  return PUBLIC_STATIC_PAGES.map((page) => ({
    ...page,
    hrefLang: toHreflang(page.locale),
    url: absoluteUrl(page.path),
  }))
}

export function getPublicFeeds() {
  return [
    {
      title: 'English RSS feed',
      locale: 'en',
      hrefLang: toHreflang('en'),
      url: absoluteUrl(getFeedPath('en')),
      type: 'application/rss+xml',
    },
    {
      title: 'Spanish RSS feed',
      locale: 'es',
      hrefLang: toHreflang('es'),
      url: absoluteUrl(getFeedPath('es')),
      type: 'application/rss+xml',
    },
  ]
}

export function getPublicLanguages() {
  return [
    {
      locale: 'en',
      hrefLang: toHreflang('en'),
      label: getLanguageLabel('en'),
      homeUrl: absoluteUrl(getHomePath('en')),
    },
    {
      locale: 'es',
      hrefLang: toHreflang('es'),
      label: getLanguageLabel('es'),
      homeUrl: absoluteUrl(getHomePath('es')),
    },
  ]
}

export function getAiDiscoveryUrls() {
  return {
    llmsTxtUrl: absoluteUrl('/llms.txt'),
    llmsFullTxtUrl: absoluteUrl('/llms-full.txt'),
    aiIndexUrl: absoluteUrl('/ai-index.json'),
    sitemapUrl: absoluteUrl('/sitemap.xml'),
    robotsUrl: absoluteUrl('/robots.txt'),
  }
}

export function getSitemapStaticPaths() {
  return [...PUBLIC_STATIC_PAGES.map((page) => page.path), ...AI_DISCOVERY_PATHS]
}
