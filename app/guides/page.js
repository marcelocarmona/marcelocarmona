import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { getTagPath } from '@/lib/i18n/routes'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import kebabCase from '@/lib/utils/kebabCase'

const GUIDE_CLUSTERS = [
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
    description: 'Service mesh, cloud-native setup, and platform-oriented engineering practices.',
    tags: ['kubernetes', 'cloud-native', 'devops', 'aws', 'aws-amplify'],
    primaryTag: 'kubernetes',
  },
]

export const metadata = {
  title: `Guides - ${siteMetadata.author}`,
  description: 'Topic hubs for React, frontend architecture, and platform engineering.',
  alternates: {
    canonical: '/guides',
  },
}

function getClusterPosts(posts, cluster) {
  const clusterTags = new Set(cluster.tags.map((tag) => kebabCase(tag)))

  return posts
    .filter((post) => (post.tags || []).some((postTag) => clusterTags.has(kebabCase(postTag))))
    .slice(0, 5)
}

export default async function GuidesPage() {
  const posts = await getAllFilesFrontMatter('blog', { locale: 'en' })

  return (
    <div className="space-y-12">
      <div className="space-y-3 pb-3 pt-6">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl md:text-6xl">
          Guides
        </h1>
        <p className="max-w-2xl text-lg leading-7 text-gray-500 dark:text-gray-400">
          Explore clustered learning paths by topic, then go deeper through related articles.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {GUIDE_CLUSTERS.map((cluster) => {
          const clusterPosts = getClusterPosts(posts, cluster)
          const tagPath = getTagPath('en', kebabCase(cluster.primaryTag))

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
                    <Link
                      href={`/${post.slug}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <Link
                  href={tagPath}
                  className="text-sm font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  View all {cluster.title} posts &rarr;
                </Link>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
