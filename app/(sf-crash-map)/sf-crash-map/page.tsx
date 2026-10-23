import { localizedMetadata } from '@/lib/metadata'
import SfCrashMapAtlas from '../_components/SfCrashMapAtlas'

const title = 'SF Crash Map'
const description = 'Explore recent DataSF injury crash records across San Francisco neighborhoods.'

export const metadata = localizedMetadata({
  kind: 'standalone',
  path: '/sf-crash-map',
  title,
  description,
})

export default function SfCrashMapPage() {
  return <SfCrashMapAtlas />
}
