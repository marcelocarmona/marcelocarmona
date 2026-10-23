import TrustPage from '../../_shared/TrustPage'
import { localizedMetadata } from '@/lib/metadata'

export const metadata = localizedMetadata({ kind: 'contact', locale: 'en' })

export default function ContactPage() {
  return <TrustPage kind="contact" locale="en" />
}
