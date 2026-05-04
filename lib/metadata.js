import siteMetadata from '@/data/siteMetadata'

const openGraphLocales = {
  en: 'en_US',
  es: 'es_ES',
}

const socialImage = {
  url: siteMetadata.socialBanner,
  width: 1200,
  height: 600,
  alt: siteMetadata.title,
}

function toOpenGraphLocale(locale) {
  return openGraphLocales[locale] || locale
}

export function absoluteUrl(pathOrUrl = '/') {
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
}) {
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
