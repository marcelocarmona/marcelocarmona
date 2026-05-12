import { getDateLocale } from '@/lib/i18n/config'
import type { LocaleInput } from '@/types/content'

const defaultOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

const formatDate = (
  date: string | number | Date | null | undefined,
  locale: LocaleInput,
  options: Intl.DateTimeFormatOptions = defaultOptions
): string => {
  if (!date) {
    return ''
  }

  return new Date(date).toLocaleDateString(getDateLocale(locale), {
    timeZone: 'UTC',
    ...options,
  })
}

export default formatDate
