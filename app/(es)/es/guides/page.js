import { getGuidesPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'
import GuidesPage from '../../../_shared/GuidesPage'

const title = 'Guias'
const description = 'Rutas de aprendizaje sobre React, arquitectura frontend y rendimiento web.'

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: getGuidesPath('es'),
    locale: 'es',
    alternateLocales: ['en'],
  }),
  alternates: {
    canonical: getGuidesPath('es'),
    languages: {
      'en-US': getGuidesPath('en'),
      'es-ES': getGuidesPath('es'),
      'x-default': getGuidesPath('en'),
    },
  },
}

export default function SpanishGuidesPage() {
  return <GuidesPage locale="es" />
}
