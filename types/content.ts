export type Locale = 'en' | 'es'
export type LocaleInput = Locale | string | null | undefined

export interface VideoFrontMatter {
  type: 'youtube'
  youTubeId: string
  title: string
  description: string | null
  uploadDate: string | null
  embedUrl: string
  watchUrl: string
  thumbnailUrl: string
  watchPagePath: string
}

export interface ContentFrontMatter {
  [key: string]: any
  slug: string
  fileName: string
  lang: Locale
  locale: Locale
  title?: string
  summary?: string
  date: string | null
  lastmod?: string | null
  tags?: string[]
  topics?: string[]
  draft?: boolean
  images?: string[]
  authors?: string[]
  layout?: string
  canonicalUrl?: string
  translationKey?: string
  video: VideoFrontMatter | null
  hasMath?: boolean
}

export interface MdxFile {
  mdxSource: string
  toc: TocHeading[]
  frontMatter: ContentFrontMatter
}

export interface TocHeading {
  value: string
  url: string
  depth: number
}

export interface AuthorFrontMatter {
  [key: string]: any
  name?: string
  avatar?: string
  occupation?: string
  company?: string
  email?: string
  twitter?: string
  linkedin?: string
  github?: string
}

export interface Pagination {
  currentPage: number
  totalPages: number
}

export interface LanguageVersion {
  href: string
  title?: string
  locale: Locale
  languageLabel: string
}

export interface NewsletterResponse {
  error: string
}
