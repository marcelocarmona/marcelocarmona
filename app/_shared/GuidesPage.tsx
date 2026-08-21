import HoverPrefetchLink from '@/components/HoverPrefetchLink'
import Link from '@/components/Link'
import { getPostPath, getTagPath } from '@/lib/i18n/routes'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import kebabCase from '@/lib/utils/kebabCase'
import type { ContentFrontMatter, Locale } from '@/types/content'

interface GuideCluster {
  id: string
  title: string
  description: string
  tags: string[]
  primaryTag: string
}

const guideCopy: Record<
  Locale,
  {
    title: string
    description: string
    viewAll: (title: string) => string
    clusters: GuideCluster[]
  }
> = {
  en: {
    title: 'Guides',
    description:
      'Explore clustered learning paths by topic, then go deeper through related articles.',
    viewAll: (title: string) => `View all ${title} posts`,
    clusters: [
      {
        id: 'react-performance',
        title: 'React Performance',
        description:
          'Patterns to reduce re-renders, improve bundle size, and deliver faster UI in production.',
        tags: ['react', 'javascript', 'typescript', 'nextjs'],
        primaryTag: 'react',
      },
      {
        id: 'frontend-architecture',
        title: 'Frontend Architecture',
        description:
          'Rendering pipelines, build tooling, and framework lifecycle patterns for maintainable apps.',
        tags: ['webpack', 'angularjs', 'rxjs', 'javascript'],
        primaryTag: 'webpack',
      },
      {
        id: 'platform-and-devops',
        title: 'Platform and DevOps',
        description:
          'Service mesh, cloud-native setup, and platform-oriented engineering practices.',
        tags: ['kubernetes', 'cloud-native', 'devops', 'aws', 'aws-amplify'],
        primaryTag: 'kubernetes',
      },
    ],
  },
  es: {
    title: 'Guias',
    description: 'Explora rutas de aprendizaje por tema y profundiza con articulos relacionados.',
    viewAll: (title: string) => `Ver todos los articulos de ${title}`,
    clusters: [
      {
        id: 'react-performance',
        title: 'Rendimiento en React',
        description:
          'Patrones para reducir re-renders, comentar JSX correctamente y construir interfaces mas claras.',
        tags: ['react', 'javascript', 'typescript'],
        primaryTag: 'react',
      },
      {
        id: 'frontend-architecture',
        title: 'Arquitectura frontend',
        description:
          'Pipelines de renderizado, tooling de build y patrones de frameworks para apps mantenibles.',
        tags: ['webpack', 'angularjs', 'rxjs', 'javascript'],
        primaryTag: 'webpack',
      },
    ],
  },
}

function getClusterPosts(posts: ContentFrontMatter[], cluster: GuideCluster) {
  const clusterTags = new Set(cluster.tags.map((tag) => kebabCase(tag)))

  return posts
    .filter((post) => (post.tags || []).some((postTag) => clusterTags.has(kebabCase(postTag))))
    .slice(0, 5)
}

export default async function GuidesPage({ locale = 'en' }: { locale?: Locale }) {
  const copy = guideCopy[locale]
  const posts = await getAllFilesFrontMatter('blog', { locale })

  return (
    <div lang={locale} className="space-y-12">
      <div className="space-y-3 pb-3 pt-6">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl md:text-6xl">
          {copy.title}
        </h1>
        <p className="max-w-2xl text-lg leading-7 text-gray-500 dark:text-gray-400">
          {copy.description}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {copy.clusters.map((cluster) => {
          const clusterPosts = getClusterPosts(posts, cluster)
          const tagPath = getTagPath(locale, kebabCase(cluster.primaryTag))

          return (
            <section
              key={cluster.id}
              className="rounded-lg border border-gray-200 p-6 dark:border-gray-700"
            >
              <h2 className="text-2xl font-bold leading-8 tracking-tight text-gray-900 dark:text-gray-100">
                {cluster.title}
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-300">{cluster.description}</p>

              <ul className="mt-4 space-y-2">
                {clusterPosts.map((post) => (
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

              {clusterPosts.length > 0 && (
                <div className="mt-5">
                  <Link
                    href={tagPath}
                    className="text-sm font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {copy.viewAll(cluster.title)} &rarr;
                  </Link>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
