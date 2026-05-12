import siteMetadata from '@/data/siteMetadata'
import { getBookPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'
import BookPage from '../../_shared/BookPage'

const title = 'Book a Call'
const description = `Schedule a meeting with ${siteMetadata.author}`

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: getBookPath('en'),
    locale: 'en',
    alternateLocales: ['es'],
  }),
  alternates: {
    canonical: getBookPath('en'),
    languages: {
      'en-US': getBookPath('en'),
      'es-ES': getBookPath('es'),
      'x-default': getBookPath('en'),
    },
  },
}

export default function EnglishBookPage() {
  return <BookPage locale="en" />
}
