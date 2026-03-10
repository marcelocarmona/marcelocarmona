export const DEFAULT_LOCALE = 'en'
export const SUPPORTED_LOCALES = ['en', 'es']

export const LOCALE_DETAILS = {
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

export function normalizeLocale(locale) {
  if (typeof locale !== 'string' || locale.length === 0) {
    return DEFAULT_LOCALE
  }

  const normalizedLocale = locale.toLowerCase()
  if (normalizedLocale.startsWith('es')) {
    return 'es'
  }

  return 'en'
}

export function getLocaleConfig(locale) {
  return LOCALE_DETAILS[normalizeLocale(locale)]
}

export function getDateLocale(locale) {
  return getLocaleConfig(locale).dateLocale
}

export function getLocalePrefix(locale) {
  return getLocaleConfig(locale).prefix
}

export function getLanguageLabel(locale) {
  return getLocaleConfig(locale).label
}

export function toHreflang(locale) {
  return getLocaleConfig(locale).hrefLang
}
