import { SpeedInsights } from '@vercel/speed-insights/next'

import LayoutWrapper from '@/components/LayoutWrapper'
import SeoSchema from '@/components/SeoSchema'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import Providers from '../providers'
import type { Locale } from '@/types/content'
import type { ReactNode } from 'react'

const htmlLanguage: Record<Locale, string> = {
  en: 'en',
  es: 'es',
}

const schemaLanguage: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
}

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

export default async function RootLayoutShell({
  children,
  locale = 'en',
}: {
  children: ReactNode
  locale?: Locale
}) {
  const posts = await getAllFilesFrontMatter('blog')
  const postLocaleMap = posts.reduce<Record<string, Locale>>((acc, post) => {
    acc[post.slug] = post.locale
    return acc
  }, {})
  const resolvedLocale: Locale = htmlLanguage[locale] ? locale : 'en'

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteMetadata.siteUrl}/#website`,
        url: siteMetadata.siteUrl,
        name: siteMetadata.title,
        description: siteMetadata.description,
        inLanguage: schemaLanguage[resolvedLocale],
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
    <html
      lang={htmlLanguage[resolvedLocale]}
      className="scroll-smooth bg-background"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground"
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
