import siteMetadata from '@/data/siteMetadata'
import { getBookPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'
import BookPage from '../../../_shared/BookPage'

const title = 'Reservar llamada'
const description = `Reserva una llamada con ${siteMetadata.author}`

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: getBookPath('es'),
    locale: 'es',
    alternateLocales: ['en'],
  }),
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
