import { buildPageMetadata } from '@/lib/metadata'
import SfCrashMapAtlas from '../_components/SfCrashMapAtlas'

const title = 'SF Crash Map'
const description = 'Explore recent DataSF injury crash records across San Francisco neighborhoods.'

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: '/sf-crash-map',
    locale: 'en',
  }),
  alternates: {
    canonical: '/sf-crash-map',
  },
}

export default function SfCrashMapPage() {
  return <SfCrashMapAtlas />
}
