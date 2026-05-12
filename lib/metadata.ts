import siteMetadata from '@/data/siteMetadata'
import type { Locale, LocaleInput } from '@/types/content'
import type { Metadata } from 'next'

const openGraphLocales: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
}

const socialImage = {
  url: siteMetadata.socialBanner,
  width: 1200,
  height: 600,
  alt: siteMetadata.title,
}

function toOpenGraphLocale(locale: LocaleInput): string {
  return locale === 'es' || locale === 'en' ? openGraphLocales[locale] : String(locale || 'en')
}

export function absoluteUrl(pathOrUrl = '/'): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }

  if (pathOrUrl === '/') {
    return siteMetadata.siteUrl
  }

  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${siteMetadata.siteUrl}${path}`
}

export function buildPageMetadata({
  title,
  description = siteMetadata.description,
  path = '/',
  locale = 'en',
  alternateLocales = [],
  image = socialImage,
}: {
  title: string
  description?: string
  path?: string
  locale?: LocaleInput
  alternateLocales?: LocaleInput[]
  image?: typeof socialImage
}): Metadata {
  const imageUrl = absoluteUrl(image.url)
  const alternateOpenGraphLocales = alternateLocales
    .map(toOpenGraphLocale)
    .filter((alternateLocale) => alternateLocale !== toOpenGraphLocale(locale))

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteMetadata.title,
      images: [
        {
          ...image,
          url: imageUrl,
        },
      ],
      locale: toOpenGraphLocale(locale),
      ...(alternateOpenGraphLocales.length > 0
        ? { alternateLocale: alternateOpenGraphLocales }
        : {}),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}
