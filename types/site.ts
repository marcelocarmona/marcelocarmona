export interface SiteMetadata {
  title: string
  author: string
  headerTitle: string
  description: string
  language: string
  theme: 'system' | 'dark' | 'light'
  siteUrl: string
  siteRepo: string
  siteLogo: string
  image: string
  socialBanner: string
  calCom: string
  email: string
  github: string
  twitter: string
  facebook: string
  youtube: string
  linkedin: string
  locale: string
  analytics: {
    plausibleDataDomain: string
    simpleAnalytics: boolean
    umamiWebsiteId: string
    googleAnalyticsId: string
    posthogAnalyticsId: string
    vercelAnalytics: boolean
    vercelSpeedInsights: boolean
  }
  newsletter: {
    provider: string
  }
  comment: {
    provider: 'giscus' | 'utterances' | 'disqus' | string
    giscusConfig: Record<string, string | undefined>
    utterancesConfig: Record<string, string | undefined>
    disqusConfig: Record<string, string | undefined>
  }
}

export interface HeaderNavLink {
  href: string
  title: string
}

export interface ProjectData {
  title: string
  description: string
  imgSrc?: string
  href?: string
}
