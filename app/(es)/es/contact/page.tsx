import TrustPage from '../../../_shared/TrustPage'
import { getTrustPageCopy } from '@/data/trustPages'
import { getContactPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'

const copy = getTrustPageCopy('contact', 'es')

export const metadata = {
  ...buildPageMetadata({
    title: copy.title,
    description: copy.description,
    path: getContactPath('es'),
    locale: 'es',
    alternateLocales: ['en'],
  }),
  alternates: {
    canonical: getContactPath('es'),
    languages: {
      'en-US': getContactPath('en'),
      'es-ES': getContactPath('es'),
      'x-default': getContactPath('en'),
    },
  },
}

export default function SpanishContactPage() {
  return <TrustPage kind="contact" locale="es" />
}
