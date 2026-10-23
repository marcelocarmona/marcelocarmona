import TrustPage from '../../_shared/TrustPage'
import { localizedMetadata } from '@/lib/metadata'

export const metadata = localizedMetadata({ kind: 'privacy', locale: 'en' })

export default function PrivacyPage() {
  return <TrustPage kind="privacy" locale="en" />
}
