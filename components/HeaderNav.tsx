import { getHeaderNavLinks } from '@/data/headerNavLinks'
import Link from './Link'
import type { LocaleInput } from '@/types/content'

export default function HeaderNav({ locale = 'en' }: { locale?: LocaleInput }) {
  const links = getHeaderNavLinks(locale)

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.title}
          href={link.href}
          className="p-1 text-muted-foreground transition-colors duration-(--duration-ui) ease-(--ease-out-soft) hover:text-foreground sm:p-4"
        >
          {link.title}
        </Link>
      ))}
    </>
  )
}
