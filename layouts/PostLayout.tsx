import Link from '@/components/Link'
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
    datePublished: date,
    dateModified: frontMatter.lastmod || date,
    image: [imageUrl],
    mainEntityOfPage: pageUrl,
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
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <header className="pt-6 xl:pb-6">
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
            </div>
          </header>
          <div
            className="divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0"
            style={{ gridTemplateRows: 'auto 1fr' }}
          >
            <dl className="pb-10 pt-6 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
              <dt className="sr-only">{postUi.authors}</dt>
              <dd>
                <ul className="flex justify-center space-x-8 sm:space-x-12 xl:block xl:space-x-0 xl:space-y-8">
                  {authorDetails.map((author) => (
                    <li className="flex items-center space-x-2" key={author.name}>
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
            <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:col-span-3 xl:row-span-2 xl:pb-0">
              <Prose className="pb-8 pt-10">
                <VideoPreviewCard video={frontMatter.video} locale={frontMatter.locale} />
                {children}
              </Prose>
              <div className="pb-6 pt-6 text-sm text-gray-700 dark:text-gray-300">
                <Link href={editUrl(fileName)}>{postUi.viewOnGitHub}</Link>
              </div>
              <Comments frontMatter={frontMatter} />
            </div>
            <footer>
              <div className="divide-gray-200 text-sm font-medium leading-5 dark:divide-gray-700 xl:col-start-1 xl:row-start-2 xl:divide-y">
                {tags && (
                  <div className="py-4 xl:py-8">
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
                  <div className="py-4 xl:py-8">
                    <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {postUi.translations}
                    </h2>
                    <ul className="space-y-2">
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
                  <div className="py-4 xl:py-8">
                    <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {postUi.relatedArticles}
                    </h2>
                    <ul className="space-y-2">
                      {relatedPosts.map((post) => (
                        <li key={post.slug}>
                          <Link
                            href={getPostPath(post)}
                            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            {post.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(next || prev) && (
                  <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                    {prev && (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {postUi.previousArticle}
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={getPostPath(frontMatter.locale, prev.slug)}>
                            {prev.title}
                          </Link>
                        </div>
                      </div>
                    )}
                    {next && (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {postUi.nextArticle}
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={getPostPath(frontMatter.locale, next.slug)}>
                            {next.title}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-4 xl:pt-8">
                <Link
                  href={blogPath}
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  &larr; {postUi.backToBlog}
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
