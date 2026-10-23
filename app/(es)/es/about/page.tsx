import { localizedMetadata } from '@/lib/metadata'
import AboutPage from '../../../_shared/AboutPage'

export const metadata = localizedMetadata({ kind: 'about', locale: 'es' })

export default function SpanishAboutPage() {
  return <AboutPage locale="es" />
}
