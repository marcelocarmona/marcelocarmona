export const DEFAULT_LOCALE = 'en'
export const SUPPORTED_LOCALES = ['en', 'es']

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

export function toHreflang(locale) {
  return normalizeLocale(locale) === 'es' ? 'es-ES' : 'en-US'
}
