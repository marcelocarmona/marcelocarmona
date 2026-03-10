'use client'

import { usePathname } from 'next/navigation'

import { DEFAULT_LOCALE, normalizeLocale } from './config'
import { getLocaleFromPathname } from './routes'

export function resolveLocaleFromPathname(pathname, postLocaleMap = {}) {
  if (typeof pathname !== 'string' || pathname.length === 0) {
    return DEFAULT_LOCALE
  }

  if (pathname === '/es' || pathname.startsWith('/es/')) {
    return 'es'
  }

  const slug = pathname.replace(/^\/+|\/+$/g, '')
  if (!slug) {
    return 'en'
  }

  return normalizeLocale(postLocaleMap[slug] || getLocaleFromPathname(pathname))
}

export function useResolvedLocale(postLocaleMap) {
  const pathname = usePathname()
  return resolveLocaleFromPathname(pathname, postLocaleMap)
}
