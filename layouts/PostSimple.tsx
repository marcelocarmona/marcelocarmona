import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import { getUiCopy } from '@/lib/i18n/ui'
import { getPostPath } from '@/lib/i18n/routes'
import { hasMeaningfulUpdate } from '@/lib/posts'
import formatDate from '@/lib/utils/formatDate'
import Comments from '@/components/comments'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import { Prose } from '@/components/ui/typography'
import type { AuthorFrontMatter, ContentFrontMatter } from '@/types/content'
import type { ReactNode } from 'react'

interface PostSimpleProps {
  frontMatter: ContentFrontMatter
  authorDetails: AuthorFrontMatter[]
  next?: ContentFrontMatter | null
  prev?: ContentFrontMatter | null
  children: ReactNode
}

export default function PostLayout({
  frontMatter,
  authorDetails,
  next,
  prev,
  children,
}: PostSimpleProps) {
  const { date, lastmod, title } = frontMatter
  const { post: postUi } = getUiCopy(frontMatter.locale)

  return (
    <SectionContainer>
      <ScrollTopAndComment locale={frontMatter.locale} />
      <article lang={frontMatter.locale || 'en'}>
        <div>
          <header>
            <div className="space-y-1 border-b border-gray-200 pb-10 text-center dark:border-gray-700">
              <dl>
                <div>
                  <dt className="sr-only">{postUi.publishedOn}</dt>
                  <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                    <time dateTime={date || undefined}>{formatDate(date, frontMatter.locale)}</time>
                  </dd>
                  {hasMeaningfulUpdate(frontMatter) && (
                    <>
                      <dt className="sr-only">{postUi.updatedOn}</dt>
                      <dd className="text-sm leading-5 text-gray-500 dark:text-gray-400">
                        {postUi.updatedOn}{' '}
                        <time dateTime={lastmod || undefined}>
                          {formatDate(lastmod, frontMatter.locale)}
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
            className="divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:divide-y-0 "
            style={{ gridTemplateRows: 'auto 1fr' }}
          >
            <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:col-span-3 xl:row-span-2 xl:pb-0">
              <Prose className="pb-8 pt-10">{children}</Prose>
            </div>
            <Comments frontMatter={frontMatter} />
            <footer>
              <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
                {prev && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={getPostPath(frontMatter.locale, prev.slug)}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      &larr; {prev.title}
                    </Link>
                  </div>
                )}
                {next && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={getPostPath(frontMatter.locale, next.slug)}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {next.title} &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
