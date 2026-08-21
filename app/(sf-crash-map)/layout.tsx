import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/inter-tight'
import '@fontsource-variable/spline-sans-mono'
import '@/css/app.css'
import './sf-crash-map.css'

import { SpeedInsights } from '@vercel/speed-insights/next'

import Link from '@/components/Link'
import SeoSchema from '@/components/SeoSchema'
import siteMetadata from '@/data/siteMetadata'
import type { ChildrenProps } from '@/types/next'
import Providers from '../providers'

export const metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: 'SF Crash Map',
    template: `%s - ${siteMetadata.author}`,
  },
  description: 'Explore recent DataSF injury crash records across San Francisco neighborhoods.',
  alternates: {
    canonical: '/sf-crash-map',
  },
  icons: {
    icon: [
      { url: '/static/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/static/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/static/favicons/favicon.ico' },
    ],
    apple: [{ url: '/static/favicons/apple-touch-icon.png', sizes: '76x76' }],
    other: [{ rel: 'mask-icon', url: '/static/favicons/safari-pinned-tab.svg', color: '#111111' }],
  },
  manifest: '/static/favicons/site.webmanifest',
}

export default function SfCrashMapRootLayout({ children }: ChildrenProps) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${siteMetadata.siteUrl}/sf-crash-map#app`,
        url: `${siteMetadata.siteUrl}/sf-crash-map`,
        name: 'SF Crash Map',
        description:
          'Explore recent DataSF injury crash records across San Francisco neighborhoods.',
        inLanguage: 'en-US',
        creator: {
          '@id': `${siteMetadata.siteUrl}/#person`,
        },
      },
      {
        '@type': 'Person',
        '@id': `${siteMetadata.siteUrl}/#person`,
        name: siteMetadata.author,
        url: siteMetadata.siteUrl,
      },
    ],
  }

  return (
    <html
      lang="en"
      className="scroll-smooth bg-neutral-950"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-neutral-950 text-white antialiased selection:bg-red-300 selection:text-neutral-950"
        suppressHydrationWarning
      >
        <SeoSchema data={websiteSchema} />
        <Providers>
          <div className="min-h-screen">
            <main>{children}</main>
          </div>
        </Providers>
        {process.env.NODE_ENV === 'production' && siteMetadata.analytics.vercelSpeedInsights && (
          <SpeedInsights />
        )}
      </body>
    </html>
  )
}
