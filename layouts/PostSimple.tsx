import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import { getUiCopy } from '@/lib/i18n/ui'
import { getPostPath } from '@/lib/i18n/routes'
import { hasMeaningfulUpdate } from '@/lib/posts'
import formatDate from '@/lib/utils/formatDate'
import Comments from '@/components/comments'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import { Typeset } from '@/components/ui/typography'
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
            <div className="space-y-1 border-b border-border pb-10 text-center">
              <dl>
                <div>
                  <dt className="sr-only">{postUi.publishedOn}</dt>
                  <dd className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <time dateTime={date || undefined}>{formatDate(date, frontMatter.locale)}</time>
                  </dd>
                  {hasMeaningfulUpdate(frontMatter) && (
                    <>
                      <dt className="sr-only">{postUi.updatedOn}</dt>
                      <dd className="font-mono text-xs text-muted-foreground">
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
            className="divide-y divide-border pb-8 xl:divide-y-0"
            style={{ gridTemplateRows: 'auto 1fr' }}
          >
            <div className="divide-y divide-border xl:col-span-3 xl:row-span-2 xl:pb-0">
              <Typeset className="pb-8 pt-10">{children}</Typeset>
            </div>
            <Comments frontMatter={frontMatter} />
            <footer>
              <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
                {prev && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={getPostPath(frontMatter.locale, prev.slug)}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      &larr; {prev.title}
                    </Link>
                  </div>
                )}
                {next && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={getPostPath(frontMatter.locale, next.slug)}
                      className="text-primary underline-offset-4 hover:underline"
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
