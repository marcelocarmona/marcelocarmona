import en from '@/data/ui/en'
import es from '@/data/ui/es'
import { normalizeLocale } from './config'

export function getUiCopy(locale) {
  return normalizeLocale(locale) === 'es' ? es : en
}
