import TrustPage from '../../_shared/TrustPage'
import { getTrustPageCopy } from '@/data/trustPages'
import { getContactPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'

const copy = getTrustPageCopy('contact', 'en')

export const metadata = {
  ...buildPageMetadata({
    title: copy.title,
    description: copy.description,
    path: getContactPath('en'),
    locale: 'en',
    alternateLocales: ['es'],
  }),
  alternates: {
    canonical: getContactPath('en'),
    languages: {
      'en-US': getContactPath('en'),
      'es-ES': getContactPath('es'),
      'x-default': getContactPath('en'),
    },
  },
}

export default function ContactPage() {
  return <TrustPage kind="contact" locale="en" />
}
