import { localizedMetadata } from '@/lib/metadata'
import GuidesPage from '../../../_shared/GuidesPage'

export const metadata = localizedMetadata({ kind: 'guides', locale: 'es' })

export default function SpanishGuidesPage() {
  return <GuidesPage locale="es" />
}
