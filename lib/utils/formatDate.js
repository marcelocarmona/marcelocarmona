import { getDateLocale } from '@/lib/i18n/config'

const defaultOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

const formatDate = (date, locale, options = defaultOptions) => {
  return new Date(date).toLocaleDateString(getDateLocale(locale), {
    timeZone: 'UTC',
    ...options,
  })
}

export default formatDate
