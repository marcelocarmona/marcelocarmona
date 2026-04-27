import siteMetadata from '@/data/siteMetadata'
import { getAboutPath } from '@/lib/i18n/routes'
import AboutPage from '../../../_shared/AboutPage'

export const metadata = {
  title: 'Acerca de mi',
  description: `Acerca de ${siteMetadata.author}`,
  alternates: {
    canonical: getAboutPath('es'),
    languages: {
      'en-US': getAboutPath('en'),
      'es-ES': getAboutPath('es'),
      'x-default': getAboutPath('en'),
    },
  },
}

export default function SpanishAboutPage() {
  return <AboutPage locale="es" />
}
