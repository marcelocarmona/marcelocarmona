import {
  getAboutPath,
  getBlogPath,
  getBookPath,
  getGuidesPath,
  getTagsPath,
} from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'
import type { LocaleInput } from '@/types/content'
import type { HeaderNavLink } from '@/types/site'

export function getHeaderNavLinks(locale: LocaleInput): HeaderNavLink[] {
  const { navigation } = getUiCopy(locale)

  return [
    { href: getBlogPath(locale), title: navigation.blog },
    { href: getGuidesPath(locale), title: navigation.guides },
    { href: getTagsPath(locale), title: navigation.tags },
    { href: getBookPath(locale), title: navigation.book },
    { href: getAboutPath(locale), title: navigation.about },
  ]
}

export default getHeaderNavLinks
