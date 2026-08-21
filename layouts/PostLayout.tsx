import Link from '@/components/Link'
import HoverPrefetchLink from '@/components/HoverPrefetchLink'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import Comments from '@/components/comments'
import SeoSchema from '@/components/SeoSchema'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import VideoPreviewCard from '@/components/VideoPreviewCard'
import { Prose } from '@/components/ui/typography'
import { getBlogPath, getPostPath } from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'
import { hasMeaningfulUpdate } from '@/lib/posts'
import formatDate from '@/lib/utils/formatDate'
import type { AuthorFrontMatter, ContentFrontMatter, LanguageVersion } from '@/types/content'
import type { ReactNode } from 'react'

const editUrl = (fileName: string) => `${siteMetadata.siteRepo}/blob/master/data/blog/${fileName}`

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

interface PostLayoutProps {
  frontMatter: ContentFrontMatter
  authorDetails: AuthorFrontMatter[]
  next?: ContentFrontMatter | null
  prev?: ContentFrontMatter | null
  relatedPosts?: ContentFrontMatter[]
  languageVersions?: LanguageVersion[]
  children: ReactNode
}

export default function PostLayout({
  frontMatter,
  authorDetails,
  next,
  prev,
  relatedPosts = [],
  languageVersions = [],
  children,
}: PostLayoutProps) {
  const { fileName, date, lastmod, title, tags } = frontMatter
  const { post: postUi } = getUiCopy(frontMatter.locale)
  const image = frontMatter.images?.[0] || siteMetadata.socialBanner
  const imageUrl = image.startsWith('http') ? image : `${siteMetadata.siteUrl}${image}`
  const blogPath = getBlogPath(frontMatter.locale)
  const pageUrl = frontMatter.canonicalUrl
    ? frontMatter.canonicalUrl.startsWith('http')
      ? frontMatter.canonicalUrl
      : `${siteMetadata.siteUrl}${frontMatter.canonicalUrl}`
    : `${siteMetadata.siteUrl}${getPostPath(frontMatter)}`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: frontMatter.summary || siteMetadata.description,
    articleSection: tags?.[0],
    keywords: frontMatter.topics || tags || [],
    datePublished: date,
    dateModified: frontMatter.lastmod || date,
    image: [imageUrl],
    mainEntityOfPage: pageUrl,
    isAccessibleForFree: true,
    inLanguage: frontMatter.locale === 'es' ? 'es-ES' : 'en-US',
    author: authorDetails.map((author) => ({
      '@type': 'Person',
      name: author.name,
      url: author.github || author.linkedin || author.twitter || siteMetadata.siteUrl,
    })),
    publisher: {
      '@type': 'Person',
      name: siteMetadata.author,
      url: siteMetadata.siteUrl,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: postUi.homeLabel,
        item: siteMetadata.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: postUi.blogLabel,
        item: `${siteMetadata.siteUrl}${blogPath}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: pageUrl,
      },
    ],
  }

  return (
    <SectionContainer>
      <ScrollTopAndComment locale={frontMatter.locale} />
      <article lang={frontMatter.locale || 'en'}>
        <SeoSchema data={articleSchema} />
        <SeoSchema data={breadcrumbSchema} />
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <header className="pb-8 pt-6">
            <div className="space-y-1 text-center">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">{postUi.publishedOn}</dt>
                  <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                    <time dateTime={date || undefined}>
                      {formatDate(date, frontMatter.locale, postDateTemplate)}
                    </time>
                  </dd>
                  {hasMeaningfulUpdate(frontMatter) && (
                    <>
                      <dt className="sr-only">{postUi.updatedOn}</dt>
                      <dd className="text-sm leading-5 text-gray-500 dark:text-gray-400">
                        {postUi.updatedOn}{' '}
                        <time dateTime={lastmod || undefined}>
                          {formatDate(lastmod, frontMatter.locale, postDateTemplate)}
                        </time>
                      </dd>
                    </>
                  )}
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
              <dl className="pt-5">
                <dt className="sr-only">{postUi.authors}</dt>
                <dd>
                  <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                    {authorDetails.map((author) => (
                      <li className="flex items-center space-x-2 text-left" key={author.name}>
                        {author.avatar && (
                          <Image
                            src={author.avatar}
                            width={38}
                            height={38}
                            alt="avatar"
                            className="h-10 w-10 rounded-full"
                          />
                        )}
                        <dl className="whitespace-nowrap text-sm font-medium leading-5">
                          <dt className="sr-only">{postUi.name}</dt>
                          <dd className="text-gray-900 dark:text-gray-100">{author.name}</dd>
                          <dt className="sr-only">{postUi.twitter}</dt>
                          <dd>
                            {author.twitter && (
                              <Link
                                href={author.twitter}
                                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                              >
                                {author.twitter.replace('https://twitter.com/', '@')}
                              </Link>
                            )}
                          </dd>
                        </dl>
                      </li>
                    ))}
                  </ul>
                </dd>
              </dl>
            </div>
          </header>
          <div className="pb-8">
            <Prose className="mx-auto max-w-[42rem] pb-8 pt-10">
              <VideoPreviewCard video={frontMatter.video} locale={frontMatter.locale} />
              {children}
            </Prose>

            <div className="mx-auto max-w-[42rem] divide-y divide-gray-200 dark:divide-gray-700">
              <footer className="divide-y divide-gray-200 text-sm font-medium leading-5 dark:divide-gray-700">
                {tags && (
                  <div className="py-6">
                    <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {postUi.tags}
                    </h2>
                    <div className="flex flex-wrap">
                      {tags.map((tag) => (
                        <Tag key={tag} locale={frontMatter.locale} text={tag} />
                      ))}
                    </div>
                  </div>
                )}
                {languageVersions.length > 0 && (
                  <div className="py-6">
                    <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {postUi.translations}
                    </h2>
                    <ul className="mt-2 space-y-2">
                      {languageVersions.map((post) => (
                        <li key={post.href}>
                          <Link
                            href={post.href}
                            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            {post.languageLabel}: {post.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {relatedPosts.length > 0 && (
                  <div className="py-6">
                    <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {postUi.relatedArticles}
                    </h2>
                    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                      {relatedPosts.map((post) => (
                        <li key={post.slug}>
                          <HoverPrefetchLink
                            href={getPostPath(post)}
                            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            {post.title}
                          </HoverPrefetchLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(next || prev) && (
                  <div className="grid gap-6 py-6 sm:grid-cols-2">
                    {prev && (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {postUi.previousArticle}
                        </h2>
                        <div className="mt-1 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={getPostPath(frontMatter.locale, prev.slug)}>
                            {prev.title}
                          </Link>
                        </div>
                      </div>
                    )}
                    {next && (
                      <div className="sm:text-right">
                        <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {postUi.nextArticle}
                        </h2>
                        <div className="mt-1 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={getPostPath(frontMatter.locale, next.slug)}>
                            {next.title}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-4 py-6">
                  <Link
                    href={blogPath}
                    className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    &larr; {postUi.backToBlog}
                  </Link>
                  <Link href={editUrl(fileName)}>{postUi.viewOnGitHub}</Link>
                </div>
              </footer>
              <div className="pt-8">
                <Comments frontMatter={frontMatter} />
              </div>
            </div>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
