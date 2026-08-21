import Link from 'next/link'
import kebabCase from '@/lib/utils/kebabCase'
import { getTagPath } from '@/lib/i18n/routes'
import type { LocaleInput } from '@/types/content'

const Tag = ({ locale = 'en', text }: { locale?: LocaleInput; text: string }) => {
  return (
    <Link
      href={getTagPath(locale, kebabCase(text))}
      className="mr-3 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-(--duration-ui) ease-(--ease-out-soft) hover:text-primary"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
