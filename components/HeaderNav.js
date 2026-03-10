import { getHeaderNavLinks } from '@/data/headerNavLinks'
import Link from './Link'

export default function HeaderNav({ locale = 'en' }) {
  const links = getHeaderNavLinks(locale)

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.title}
          href={link.href}
          className="p-1 font-medium text-gray-900 dark:text-gray-100 sm:p-4"
        >
          {link.title}
        </Link>
      ))}
    </>
  )
}
