import { localizedMetadata } from '@/lib/metadata'
import BookPage from '../../../_shared/BookPage'

export const metadata = localizedMetadata({ kind: 'book', locale: 'es' })

export default function SpanishBookPage() {
  return <BookPage locale="es" />
}
