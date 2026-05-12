import en from '@/data/ui/en'
import es from '@/data/ui/es'
import { normalizeLocale } from './config'
import type { LocaleInput } from '@/types/content'

export function getUiCopy(locale: LocaleInput): typeof en {
  return normalizeLocale(locale) === 'es' ? es : en
}
