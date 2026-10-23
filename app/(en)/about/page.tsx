import { localizedMetadata } from '@/lib/metadata'
import AboutPage from '../../_shared/AboutPage'

export const metadata = localizedMetadata({ kind: 'about', locale: 'en' })

export default function EnglishAboutPage() {
  return <AboutPage locale="en" />
}
