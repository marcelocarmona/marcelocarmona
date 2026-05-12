import Link from 'next/link'
import kebabCase from '@/lib/utils/kebabCase'
import { getTagPath } from '@/lib/i18n/routes'
import type { LocaleInput } from '@/types/content'

const Tag = ({ locale = 'en', text }: { locale?: LocaleInput; text: string }) => {
  return (
    <Link
      href={getTagPath(locale, kebabCase(text))}
      className="mr-3 text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
