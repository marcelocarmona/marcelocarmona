import TrustPage from '../../../_shared/TrustPage'
import { localizedMetadata } from '@/lib/metadata'

export const metadata = localizedMetadata({ kind: 'contact', locale: 'es' })

export default function SpanishContactPage() {
  return <TrustPage kind="contact" locale="es" />
}
