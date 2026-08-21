import Link from '@/components/Link'
import ArticleRail from '@/components/ArticleRail'
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
import { Typeset } from '@/components/ui/typography'
import { getBlogPath, getPostPath } from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'
import { hasMeaningfulUpdate } from '@/lib/posts'
import formatDate from '@/lib/utils/formatDate'
import type {
  AuthorFrontMatter,
  ContentFrontMatter,
  LanguageVersion,
  TocHeading,
} from '@/types/content'
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
  toc?: TocHeading[]
  children: ReactNode
}

export default function PostLayout({
  frontMatter,
  authorDetails,
  next,
  prev,
  relatedPosts = [],
  languageVersions = [],
  toc = [],
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
        <div>
          <header className="mx-auto max-w-measure pb-10 pt-6">
            <dl>
              <dt className="sr-only">{postUi.publishedOn}</dt>
              <dd className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <time dateTime={date || undefined}>
                  {formatDate(date, frontMatter.locale, postDateTemplate)}
                </time>
                {hasMeaningfulUpdate(frontMatter) && (
                  <>
                    <span aria-hidden="true"> / </span>
                    <span>
                      {postUi.updatedOn}{' '}
                      <time dateTime={lastmod || undefined}>
                        {formatDate(lastmod, frontMatter.locale, postDateTemplate)}
                      </time>
                    </span>
                  </>
                )}
              </dd>
            </dl>
            <div className="mt-5">
              <PageTitle>{title}</PageTitle>
            </div>
            <dl className="mt-8 border-t border-border pt-5">
              <dt className="sr-only">{postUi.authors}</dt>
              <dd>
                <ul className="flex flex-wrap gap-x-8 gap-y-3">
                  {authorDetails.map((author) => (
                    <li className="flex items-center gap-2.5" key={author.name}>
                      {author.avatar && (
                        <Image
                          src={author.avatar}
                          width={38}
                          height={38}
                          alt="avatar"
                          className="size-9 rounded-full"
                        />
                      )}
                      <dl className="whitespace-nowrap text-sm leading-5">
                        <dt className="sr-only">{postUi.name}</dt>
                        <dd className="text-foreground">{author.name}</dd>
                        <dt className="sr-only">{postUi.twitter}</dt>
                        <dd>
                          {author.twitter && (
                            <Link
                              href={author.twitter}
                              className="font-mono text-xs text-muted-foreground underline-offset-4 hover:underline"
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
          </header>
          <div className="relative pb-8">
            <ArticleRail toc={toc} label={postUi.contents} />
            <Typeset className="mx-auto max-w-measure pb-8">
              <VideoPreviewCard video={frontMatter.video} locale={frontMatter.locale} />
              {children}
            </Typeset>

            <div className="mx-auto max-w-measure divide-y divide-border">
              <footer className="divide-y divide-border text-sm leading-5">
                {tags && (
                  <div className="py-6">
                    <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {postUi.tags}
                    </h2>
                    <div className="mt-3 flex flex-wrap">
                      {tags.map((tag) => (
                        <Tag key={tag} locale={frontMatter.locale} text={tag} />
                      ))}
                    </div>
                  </div>
                )}
                {languageVersions.length > 0 && (
                  <div className="py-6">
                    <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {postUi.translations}
                    </h2>
                    <ul className="mt-2 space-y-2">
                      {languageVersions.map((post) => (
                        <li key={post.href}>
                          <Link
                            href={post.href}
                            className="text-primary underline-offset-4 hover:underline"
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
                    <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {postUi.relatedArticles}
                    </h2>
                    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                      {relatedPosts.map((post) => (
                        <li key={post.slug}>
                          <HoverPrefetchLink
                            href={getPostPath(post)}
                            className="text-primary underline-offset-4 hover:underline"
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
                        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {postUi.previousArticle}
                        </h2>
                        <div className="mt-1 text-primary underline-offset-4 hover:underline">
                          <Link href={getPostPath(frontMatter.locale, prev.slug)}>
                            {prev.title}
                          </Link>
                        </div>
                      </div>
                    )}
                    {next && (
                      <div className="sm:text-right">
                        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {postUi.nextArticle}
                        </h2>
                        <div className="mt-1 text-primary underline-offset-4 hover:underline">
                          <Link href={getPostPath(frontMatter.locale, next.slug)}>
                            {next.title}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-4 py-6">
                  <Link href={blogPath} className="text-primary underline-offset-4 hover:underline">
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
