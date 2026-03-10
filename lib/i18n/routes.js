import { DEFAULT_LOCALE, getLocalePrefix } from './config'

export function getLocaleFromPathname(pathname) {
  if (typeof pathname !== 'string' || pathname.length === 0) {
    return DEFAULT_LOCALE
  }

  return pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en'
}

export function getHomePath(locale) {
  const prefix = getLocalePrefix(locale)
  return prefix || '/'
}

export function getBlogPath(locale) {
  const prefix = getLocalePrefix(locale)
  return prefix ? `${prefix}/blog` : '/blog'
}

export function getBlogPagePath(locale, pageNumber) {
  const normalizedPage = Number.isFinite(pageNumber) ? pageNumber : Number.parseInt(pageNumber, 10)
  const page = Number.isNaN(normalizedPage) || normalizedPage < 1 ? 1 : normalizedPage

  if (page <= 1) {
    return getBlogPath(locale)
  }

  return `${getBlogPath(locale)}/page/${page}`
}

export function getTagsPath(locale) {
  const prefix = getLocalePrefix(locale)
  return prefix ? `${prefix}/tags` : '/tags'
}

export function getTagPath(locale, tag) {
  return `${getTagsPath(locale)}/${tag}`
}

export function getFeedPath(locale) {
  const prefix = getLocalePrefix(locale)
  return prefix ? `${prefix}/feed.xml` : '/feed.xml'
}

export function getBookPath() {
  return '/book'
}

export function getAboutPath() {
  return '/about'
}

export function getGuidesPath() {
  return '/guides'
}
