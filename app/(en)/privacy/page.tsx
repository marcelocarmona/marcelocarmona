import TrustPage from '../../_shared/TrustPage'
import { getTrustPageCopy } from '@/data/trustPages'
import { getPrivacyPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'

const copy = getTrustPageCopy('privacy', 'en')

export const metadata = {
  ...buildPageMetadata({
    title: copy.title,
    description: copy.description,
    path: getPrivacyPath('en'),
    locale: 'en',
    alternateLocales: ['es'],
  }),
  alternates: {
    canonical: getPrivacyPath('en'),
    languages: {
      'en-US': getPrivacyPath('en'),
      'es-ES': getPrivacyPath('es'),
      'x-default': getPrivacyPath('en'),
    },
  },
}

export default function PrivacyPage() {
  return <TrustPage kind="privacy" locale="en" />
}
