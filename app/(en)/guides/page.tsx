import { localizedMetadata } from '@/lib/metadata'
import GuidesPage from '../../_shared/GuidesPage'

export const metadata = localizedMetadata({ kind: 'guides', locale: 'en' })

export default function EnglishGuidesPage() {
  return <GuidesPage locale="en" />
}
