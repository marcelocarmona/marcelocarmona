import TrustPage from '../../../_shared/TrustPage'
import { localizedMetadata } from '@/lib/metadata'

export const metadata = localizedMetadata({ kind: 'privacy', locale: 'es' })

export default function SpanishPrivacyPage() {
  return <TrustPage kind="privacy" locale="es" />
}
