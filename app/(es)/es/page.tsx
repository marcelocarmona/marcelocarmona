import Image from '@/components/Image'
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
const title = 'Marcelo Carmona'
const description =
  'Notas de ingeniería de software sobre productos web, arquitectura frontend, infraestructura cloud y entrega mantenible por Marcelo Carmona.'
const headline =
  'Ingeniero de software creando productos web confiables y los sistemas que los sostienen.'
const intro =
  'Trabajo entre arquitectura frontend, infraestructura cloud y flujos de entrega para convertir ideas de producto en software mantenible. Me importan las interfaces claras, los sistemas resilientes y las decisiones de ingeniería que ayudan a los equipos a avanzar con confianza.'

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: getHomePath('es'),
    locale: 'es',
    alternateLocales: ['en'],
  }),
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
  const displayPosts = posts.slice(0, MAX_DISPLAY)

  return (
    <>
      <div lang="es" className="space-y-14">
        <section className="border-b border-gray-200 pb-12 pt-8 dark:border-gray-700">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_12rem] md:items-start md:gap-10">
            <div className="max-w-3xl space-y-5 text-center md:text-left">
              <p className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Ingeniería de software
              </p>
              <h1 className="display-title text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-4xl md:text-5xl">
                {headline}
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-500 dark:text-gray-400 md:mx-0">
                {intro}
              </p>
            </div>

            <div className="order-first flex justify-center md:order-none md:justify-end">
              <div className="rounded-full bg-gray-50 p-1 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
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

        <section>
          <div className="pb-2">
            <h2 className="text-2xl font-bold leading-8 tracking-tight text-gray-900 dark:text-gray-100">
              Escritura técnica reciente
            </h2>
          </div>

          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {!posts.length && list.noPostsFound}
            {displayPosts.map((frontMatter) => {
              const { slug, date, lastmod, title, summary, tags } = frontMatter
              return (
                <li key={slug} className="py-12">
                  <article lang="es">
                    <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                      <dl className="space-y-1">
                        <dt className="sr-only">{list.publishedOn}</dt>
                        <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                          <time dateTime={date || undefined}>{formatDate(date, 'es')}</time>
                        </dd>
                        {hasMeaningfulUpdate(frontMatter) && (
                          <>
                            <dt className="sr-only">{list.updatedOn}</dt>
                            <dd className="text-sm leading-5 text-gray-500 dark:text-gray-400">
                              {list.updatedOn}{' '}
                              <time dateTime={lastmod || undefined}>
                                {formatDate(lastmod, 'es')}
                              </time>
                            </dd>
                          </>
                        )}
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
                              {(tags || []).map((tag) => (
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
                            Leer más &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href={getBlogPath('es')}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="todos los artículos"
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
