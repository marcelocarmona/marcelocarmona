'use client'

import { usePathname } from 'next/navigation'

import { DEFAULT_LOCALE, normalizeLocale } from './config'
import { getLocaleFromPathname } from './routes'
import type { Locale } from '@/types/content'

export function resolveLocaleFromPathname(
  pathname: string | null,
  postLocaleMap: Record<string, Locale> = {}
): Locale {
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

export function useResolvedLocale(postLocaleMap?: Record<string, Locale>): Locale {
  const pathname = usePathname()
  return resolveLocaleFromPathname(pathname, postLocaleMap)
}
