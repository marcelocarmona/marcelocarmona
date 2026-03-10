import {
  getAboutPath,
  getBlogPath,
  getBookPath,
  getGuidesPath,
  getTagsPath,
} from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'

export function getHeaderNavLinks(locale) {
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
