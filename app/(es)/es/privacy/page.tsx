import TrustPage from '../../../_shared/TrustPage'
import { getTrustPageCopy } from '@/data/trustPages'
import { getPrivacyPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'

const copy = getTrustPageCopy('privacy', 'es')

export const metadata = {
  ...buildPageMetadata({
    title: copy.title,
    description: copy.description,
    path: getPrivacyPath('es'),
    locale: 'es',
    alternateLocales: ['en'],
  }),
  alternates: {
    canonical: getPrivacyPath('es'),
    languages: {
      'en-US': getPrivacyPath('en'),
      'es-ES': getPrivacyPath('es'),
      'x-default': getPrivacyPath('en'),
    },
  },
}

export default function SpanishPrivacyPage() {
  return <TrustPage kind="privacy" locale="es" />
}
