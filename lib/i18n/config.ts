import type { Locale, LocaleInput } from '@/types/content'

export const DEFAULT_LOCALE = 'en'
export const SUPPORTED_LOCALES: Locale[] = ['en', 'es']

export const LOCALE_DETAILS: Record<
  Locale,
  {
    dateLocale: string
    hrefLang: string
    label: string
    prefix: string
  }
> = {
  en: {
    dateLocale: 'en-US',
    hrefLang: 'en-US',
    label: 'English',
    prefix: '',
  },
  es: {
    dateLocale: 'es-ES',
    hrefLang: 'es-ES',
    label: 'Espanol',
    prefix: '/es',
  },
}

export function normalizeLocale(locale: LocaleInput): Locale {
  if (typeof locale !== 'string' || locale.length === 0) {
    return DEFAULT_LOCALE
  }

  const normalizedLocale = locale.toLowerCase()
  if (normalizedLocale.startsWith('es')) {
    return 'es'
  }

  return 'en'
}

export function getLocaleConfig(locale: LocaleInput) {
  return LOCALE_DETAILS[normalizeLocale(locale)]
}

export function getDateLocale(locale: LocaleInput): string {
  return getLocaleConfig(locale).dateLocale
}

export function getLocalePrefix(locale: LocaleInput): string {
  return getLocaleConfig(locale).prefix
}

export function getLanguageLabel(locale: LocaleInput): string {
  return getLocaleConfig(locale).label
}

export function toHreflang(locale: LocaleInput): string {
  return getLocaleConfig(locale).hrefLang
}
