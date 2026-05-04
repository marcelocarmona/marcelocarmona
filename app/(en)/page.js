import Link from '@/components/Link'
import NewsletterForm from '@/components/NewsletterForm'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { getBlogPath, getFeedPath, getHomePath, getPostPath } from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'
import { buildPageMetadata } from '@/lib/metadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { hasMeaningfulUpdate } from '@/lib/posts'
import formatDate from '@/lib/utils/formatDate'

const MAX_DISPLAY = 5
const title = 'React, Next.js, and Frontend Engineering'
const description = siteMetadata.description

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
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="display-title text-3xl font-extrabold leading-9 text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Notes on React, Next.js, frontend performance, and software architecture.
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && list.noPostsFound}
          {displayPosts.map((frontMatter) => {
            const { slug, date, lastmod, title, summary, tags } = frontMatter
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl className="space-y-1">
                      <dt className="sr-only">{list.publishedOn}</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date, 'en')}</time>
                      </dd>
                      {hasMeaningfulUpdate(frontMatter) && (
                        <>
                          <dt className="sr-only">{list.updatedOn}</dt>
                          <dd className="text-sm leading-5 text-gray-500 dark:text-gray-400">
                            {list.updatedOn}{' '}
                            <time dateTime={lastmod}>{formatDate(lastmod, 'en')}</time>
                          </dd>
                        </>
                      )}
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link
                              href={getPostPath('en', slug)}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} locale="en" text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base font-medium leading-6">
                        <Link
                          href={getPostPath('en', slug)}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`Read "${title}"`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href={getBlogPath('en')}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="all posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter.provider !== '' && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </>
  )
}
