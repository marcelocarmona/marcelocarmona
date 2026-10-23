import { localizedMetadata } from '@/lib/metadata'
import BookPage from '../../_shared/BookPage'

export const metadata = localizedMetadata({ kind: 'book', locale: 'en' })

export default function EnglishBookPage() {
  return <BookPage locale="en" />
}
