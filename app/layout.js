import '@fontsource/inter/index.css'
import 'katex/dist/katex.css'
import '@/css/app.css'

import { SpeedInsights } from '@vercel/speed-insights/next'
import siteMetadata from '@/data/siteMetadata'
import LayoutWrapper from '@/components/LayoutWrapper'
import SeoSchema from '@/components/SeoSchema'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import Providers from './providers'

export const metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s - ${siteMetadata.author}`,
  },
  description: siteMetadata.description,
  alternates: {
    languages: {
      'en-US': '/',
      'es-ES': '/es',
      'x-default': '/',
    },
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  icons: {
    icon: [
      { url: '/static/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/static/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/static/favicons/favicon.ico' },
    ],
    apple: [{ url: '/static/favicons/apple-touch-icon.png', sizes: '76x76' }],
    other: [{ rel: 'mask-icon', url: '/static/favicons/safari-pinned-tab.svg', color: '#5bbad5' }],
  },
  manifest: '/static/favicons/site.webmanifest',
}

export default async function RootLayout({ children }) {
  const posts = await getAllFilesFrontMatter('blog')
  const postLocaleMap = posts.reduce((acc, post) => {
    acc[post.slug] = post.locale
    return acc
  }, {})

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteMetadata.siteUrl}/#website`,
        url: siteMetadata.siteUrl,
        name: siteMetadata.title,
        description: siteMetadata.description,
        inLanguage: 'en-US',
      },
      {
        '@type': 'Person',
        '@id': `${siteMetadata.siteUrl}/#person`,
        name: siteMetadata.author,
        url: siteMetadata.siteUrl,
        email: siteMetadata.email,
        sameAs: [siteMetadata.github, siteMetadata.twitter, siteMetadata.linkedin].filter(Boolean),
      },
    ],
  }

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className="min-h-screen antialiased selection:bg-primary-200 selection:text-primary-950 dark:selection:bg-primary-700 dark:selection:text-white"
        suppressHydrationWarning
      >
        <SeoSchema data={websiteSchema} />
        <Providers>
          <LayoutWrapper postLocaleMap={postLocaleMap}>{children}</LayoutWrapper>
        </Providers>
        {process.env.NODE_ENV === 'production' && siteMetadata.analytics.vercelSpeedInsights && (
          <SpeedInsights />
        )}
      </body>
    </html>
  )
}
