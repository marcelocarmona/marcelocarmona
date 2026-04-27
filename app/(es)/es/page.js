import Link from '@/components/Link'
import NewsletterForm from '@/components/NewsletterForm'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { getBlogPath, getFeedPath, getHomePath, getPostPath } from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import formatDate from '@/lib/utils/formatDate'

const MAX_DISPLAY = 5

export const metadata = {
  title: 'React, Next.js y arquitectura frontend',
  description:
    'Articulos en espanol sobre React, Next.js, rendimiento web y arquitectura frontend.',
  alternates: {
    canonical: getHomePath('es'),
    languages: {
      'en-US': getHomePath('en'),
      'es-ES': getHomePath('es'),
      'x-default': getHomePath('en'),
    },
    types: {
      'application/rss+xml': getFeedPath('es'),
    },
  },
}

export default async function SpanishHomePage() {
  const posts = await getAllFilesFrontMatter('blog', { locale: 'es' })
  const { list } = getUiCopy('es')

  return (
    <>
      <div lang="es" className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            React, Next.js y arquitectura frontend
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Articulos en espanol sobre React, Next.js, rendimiento web y arquitectura de software.
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && list.noPostsFound}
          {posts.slice(0, MAX_DISPLAY).map((frontMatter) => {
            const { slug, date, title, summary, tags } = frontMatter
            return (
              <li key={slug} className="py-12">
                <article lang="es">
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">{list.publishedOn}</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date, 'es')}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link
                              href={getPostPath('es', slug)}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} locale="es" text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base font-medium leading-6">
                        <Link
                          href={getPostPath('es', slug)}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`Leer "${title}"`}
                        >
                          Leer mas &rarr;
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
            href={getBlogPath('es')}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="todos los articulos"
          >
            Ver todos &rarr;
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
