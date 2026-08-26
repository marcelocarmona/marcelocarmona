import Image from '@/components/Image'
import HomeFocusAreas from '@/components/HomeFocusAreas'
import HoverPrefetchLink from '@/components/HoverPrefetchLink'
import Link from '@/components/Link'
import NewsletterForm from '@/components/NewsletterForm'
import Tag from '@/components/Tag'
import { DisplayTitle, Typeset } from '@/components/ui/typography'
import siteMetadata from '@/data/siteMetadata'
import { getBlogPath, getFeedPath, getHomePath, getPostPath } from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'
import { buildPageMetadata } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { hasMeaningfulUpdate } from '@/lib/posts'
import formatDate from '@/lib/utils/formatDate'

const MAX_DISPLAY = 5
const title = 'Software Engineer | Frontend, Cloud, AI | Marcelo Carmona'
const description = siteMetadata.description
const headline = 'I build web products, cloud infrastructure, and AI tooling.'
const intro =
  'I work across frontend architecture, cloud infrastructure, and delivery workflows to turn product ideas into maintainable software. I care about clear interfaces, resilient systems, and engineering decisions that help teams move with confidence.'

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: getHomePath('en'),
    locale: 'en',
    alternateLocales: ['es'],
  }),
  alternates: {
    canonical: getHomePath('en'),
    languages: {
      'en-US': getHomePath('en'),
      'es-ES': getHomePath('es'),
      'x-default': getHomePath('en'),
    },
    types: {
      'application/rss+xml': getFeedPath('en'),
    },
  },
}

export default async function HomePage() {
  const posts = await getAllFilesFrontMatter('blog', { locale: 'en' })
  const { list } = getUiCopy('en')
  const displayPosts = posts.slice(0, MAX_DISPLAY)

  return (
    <>
      <div className="space-y-14">
        <section className="border-b border-border pb-12 pt-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_12rem] md:items-start md:gap-10">
            <div className="max-w-3xl space-y-5 text-center md:text-left">
              <p className="text-sm font-semibold uppercase text-muted-foreground">
                Software engineering
              </p>
              <DisplayTitle
                as="h1"
                className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl"
              >
                {headline}
              </DisplayTitle>
              <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground md:mx-0">
                {intro}
              </p>
            </div>

            <div className="order-first flex justify-center md:order-none md:justify-end">
              <div className="rounded-full bg-muted p-1 shadow-sm ring-1 ring-border">
                <Image
                  src="/static/images/marcelo.jpg"
                  alt="Marcelo Carmona"
                  width={192}
                  height={192}
                  className="h-32 w-32 rounded-full object-cover sm:h-36 sm:w-36 md:h-44 md:w-44"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <HomeFocusAreas locale="en" />

        <section>
          <div className="pb-2">
            <h2 className="font-display text-2xl font-semibold leading-snug tracking-tight text-foreground">
              Recent technical writing
            </h2>
          </div>

          <ul className="divide-y divide-border">
            {!posts.length && list.noPostsFound}
            {displayPosts.map((frontMatter) => {
              const { slug, date, lastmod, title, summary, tags } = frontMatter
              return (
                <li key={slug} className="py-12">
                  <article>
                    <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                      <dl className="space-y-1">
                        <dt className="sr-only">{list.publishedOn}</dt>
                        <dd className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          <time dateTime={date || undefined}>{formatDate(date, 'en')}</time>
                        </dd>
                        {hasMeaningfulUpdate(frontMatter) && (
                          <>
                            <dt className="sr-only">{list.updatedOn}</dt>
                            <dd className="font-mono text-xs text-muted-foreground">
                              {list.updatedOn}{' '}
                              <time dateTime={lastmod || undefined}>
                                {formatDate(lastmod, 'en')}
                              </time>
                            </dd>
                          </>
                        )}
                      </dl>
                      <div className="space-y-5 xl:col-span-3">
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-display text-2xl font-semibold leading-snug tracking-tight">
                              <HoverPrefetchLink
                                href={getPostPath('en', slug)}
                                className="text-foreground"
                              >
                                {title}
                              </HoverPrefetchLink>
                            </h3>
                            <div className="flex flex-wrap">
                              {(tags || []).map((tag) => (
                                <Tag key={tag} locale="en" text={tag} />
                              ))}
                            </div>
                          </div>
                          <Typeset variant="note">{summary}</Typeset>
                        </div>
                        <div className="text-base font-medium leading-6">
                          <HoverPrefetchLink
                            href={getPostPath('en', slug)}
                            className="text-primary underline-offset-4 hover:underline"
                            aria-label={`Read "${title}"`}
                          >
                            Read more &rarr;
                          </HoverPrefetchLink>
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
          {posts.length > MAX_DISPLAY && (
            <div className="flex justify-end text-base font-medium leading-6">
              <Link
                href={getBlogPath('en')}
                className="text-primary underline-offset-4 hover:underline"
                aria-label="all posts"
              >
                All Posts &rarr;
              </Link>
            </div>
          )}
        </section>
      </div>
      {siteMetadata.newsletter.provider !== '' && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </>
  )
}
