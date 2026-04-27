import siteMetadata from '@/data/siteMetadata'
import { getBookPath } from '@/lib/i18n/routes'
import BookPage from '../../../_shared/BookPage'

export const metadata = {
  title: 'Reservar llamada',
  description: `Reserva una llamada con ${siteMetadata.author}`,
  alternates: {
    canonical: getBookPath('es'),
    languages: {
      'en-US': getBookPath('en'),
      'es-ES': getBookPath('es'),
      'x-default': getBookPath('en'),
    },
  },
}

export default function SpanishBookPage() {
  return <BookPage locale="es" />
}
