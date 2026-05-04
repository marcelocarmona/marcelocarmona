import { getGuidesPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'
import GuidesPage from '../../_shared/GuidesPage'

const title = 'Guides'
const description = 'Topic hubs for React, frontend architecture, and platform engineering.'

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: getGuidesPath('en'),
    locale: 'en',
    alternateLocales: ['es'],
  }),
  alternates: {
    canonical: getGuidesPath('en'),
    languages: {
      'en-US': getGuidesPath('en'),
      'es-ES': getGuidesPath('es'),
      'x-default': getGuidesPath('en'),
    },
  },
}

export default function EnglishGuidesPage() {
  return <GuidesPage locale="en" />
}
