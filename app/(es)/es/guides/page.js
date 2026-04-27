import { getGuidesPath } from '@/lib/i18n/routes'
import GuidesPage from '../../../_shared/GuidesPage'

export const metadata = {
  title: 'Guias',
  description: 'Rutas de aprendizaje sobre React, arquitectura frontend y rendimiento web.',
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
