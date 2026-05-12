import { DEFAULT_LOCALE, getLocalePrefix } from './config'
import type { ContentFrontMatter, Locale, LocaleInput } from '@/types/content'

type RoutablePost = Pick<ContentFrontMatter, 'locale' | 'slug'>

export function getLocaleFromPathname(pathname: string): Locale {
  if (typeof pathname !== 'string' || pathname.length === 0) {
    return DEFAULT_LOCALE
  }

  return pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en'
}

export function getHomePath(locale: LocaleInput): string {
  const prefix = getLocalePrefix(locale)
  return prefix || '/'
}

export function getBlogPath(locale: LocaleInput): string {
  const prefix = getLocalePrefix(locale)
  return prefix ? `${prefix}/blog` : '/blog'
}

export function getBlogPagePath(locale: LocaleInput, pageNumber: number | string): string {
  const normalizedPage =
    typeof pageNumber === 'number' && Number.isFinite(pageNumber)
      ? pageNumber
      : Number.parseInt(String(pageNumber), 10)
  const page = Number.isNaN(normalizedPage) || normalizedPage < 1 ? 1 : normalizedPage

  if (page <= 1) {
    return getBlogPath(locale)
  }

  return `${getBlogPath(locale)}/page/${page}`
}

export function getTagsPath(locale: LocaleInput): string {
  const prefix = getLocalePrefix(locale)
  return prefix ? `${prefix}/tags` : '/tags'
}

export function getTagPath(locale: LocaleInput, tag: string): string {
  return `${getTagsPath(locale)}/${tag}`
}

export function getPostPath(postOrLocale: LocaleInput | RoutablePost, slug?: string): string {
  const locale =
    typeof postOrLocale === 'object' && postOrLocale !== null ? postOrLocale.locale : postOrLocale
  const postSlug =
    typeof postOrLocale === 'object' && postOrLocale !== null ? postOrLocale.slug : slug || ''
  const prefix = getLocalePrefix(locale)

  return prefix ? `${prefix}/${postSlug}` : `/${postSlug}`
}

export function getWatchPath(postOrLocale: LocaleInput | RoutablePost, slug?: string): string {
  const locale =
    typeof postOrLocale === 'object' && postOrLocale !== null ? postOrLocale.locale : postOrLocale
  const postSlug =
    typeof postOrLocale === 'object' && postOrLocale !== null ? postOrLocale.slug : slug || ''
  const prefix = getLocalePrefix(locale)

  return prefix ? `${prefix}/watch/${postSlug}` : `/watch/${postSlug}`
}

export function getFeedPath(locale: LocaleInput): string {
  const prefix = getLocalePrefix(locale)
  return prefix ? `${prefix}/feed.xml` : '/feed.xml'
}

export function getBookPath(locale: LocaleInput): string {
  const prefix = getLocalePrefix(locale)
  return prefix ? `${prefix}/book` : '/book'
}

export function getAboutPath(locale: LocaleInput): string {
  const prefix = getLocalePrefix(locale)
  return prefix ? `${prefix}/about` : '/about'
}

export function getGuidesPath(locale: LocaleInput): string {
  const prefix = getLocalePrefix(locale)
  return prefix ? `${prefix}/guides` : '/guides'
}
