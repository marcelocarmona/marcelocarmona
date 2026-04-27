import { getGuidesPath } from '@/lib/i18n/routes'
import GuidesPage from '../../_shared/GuidesPage'

export const metadata = {
  title: 'Guides',
  description: 'Topic hubs for React, frontend architecture, and platform engineering.',
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
