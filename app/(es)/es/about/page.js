import siteMetadata from '@/data/siteMetadata'
import { getAboutPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'
import AboutPage from '../../../_shared/AboutPage'

const title = 'Acerca de mi'
const description = `Acerca de ${siteMetadata.author}`

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: getAboutPath('es'),
    locale: 'es',
    alternateLocales: ['en'],
  }),
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
