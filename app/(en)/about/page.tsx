import siteMetadata from '@/data/siteMetadata'
import { getAboutPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'
import AboutPage from '../../_shared/AboutPage'

const title = 'About'
const description = `${siteMetadata.author} is a software engineer focused on frontend architecture, React, Next.js, and performance-minded product delivery.`

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: getAboutPath('en'),
    locale: 'en',
    alternateLocales: ['es'],
  }),
  alternates: {
    canonical: getAboutPath('en'),
    languages: {
      'en-US': getAboutPath('en'),
      'es-ES': getAboutPath('es'),
      'x-default': getAboutPath('en'),
    },
  },
}

export default function EnglishAboutPage() {
  return <AboutPage locale="en" />
}
