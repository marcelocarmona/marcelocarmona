import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { getTagsPath } from '@/lib/i18n/routes'
import { buildPageMetadata } from '@/lib/metadata'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'

const title = 'Tags en espanol'
const description = 'Temas sobre los que escribo en espanol'

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: getTagsPath('es'),
    locale: 'es',
    alternateLocales: ['en'],
  }),
  alternates: {
    canonical: getTagsPath('es'),
    languages: {
      'en-US': getTagsPath('en'),
      'es-ES': getTagsPath('es'),
      'x-default': getTagsPath('en'),
    },
  },
}

export default async function SpanishTagsPage() {
  const tags = await getAllTags('blog', { locale: 'es' })
  const sortedTags = Object.keys(tags).sort((a, b) => tags[b] - tags[a])

  return (
    <div
      lang="es"
      className="flex flex-col items-start justify-start divide-y divide-border md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0"
    >
      <div className="space-x-2 pb-8 pt-6 md:space-y-5">
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:border-r md:border-border md:px-6 md:text-5xl">
          Tags
        </h1>
      </div>
      <div className="flex max-w-lg flex-wrap">
        {Object.keys(tags).length === 0 && 'No tags found.'}
        {sortedTags.map((tag) => (
          <div key={tag} className="mb-2 mr-5 mt-2">
            <Tag locale="es" text={tag} />
            <Link
              href={`${getTagsPath('es')}/${kebabCase(tag)}`}
              className="-ml-2 text-sm font-semibold uppercase text-muted-foreground"
            >
              {` (${tags[tag]})`}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
