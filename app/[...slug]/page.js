import { notFound } from 'next/navigation'

import PageTitle from '@/components/PageTitle'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import siteMetadata from '@/data/siteMetadata'
import { formatSlug, getAllFilesFrontMatter, getFileBySlug, getFiles } from '@/lib/mdx'

const DEFAULT_LAYOUT = 'PostLayout'

export async function generateStaticParams() {
  const posts = getFiles('blog')
  return posts.map((post) => ({
    slug: formatSlug(post).split('/'),
  }))
}

export async function generateMetadata({ params }) {
  const { slug: slugParts } = await params
  if (
    !Array.isArray(slugParts) ||
    slugParts.length === 0 ||
    slugParts.some((part) => part[0] === '.')
  ) {
    return {}
  }

  const slug = slugParts.join('/')
  const knownSlugs = getFiles('blog').map((post) => formatSlug(post))
  if (!knownSlugs.includes(slug)) {
    return {}
  }

  const post = await getFileBySlug('blog', slug)
  const frontMatter = post.frontMatter
  const image = frontMatter.images?.[0] || siteMetadata.socialBanner
  const imageUrl = image.startsWith('http') ? image : `${siteMetadata.siteUrl}${image}`

  return {
    title: frontMatter.title,
    description: frontMatter.summary || siteMetadata.description,
    alternates: {
      canonical: frontMatter.canonicalUrl || `/${frontMatter.slug}`,
    },
    openGraph: {
      title: frontMatter.title,
      description: frontMatter.summary || siteMetadata.description,
      type: 'article',
      url: `${siteMetadata.siteUrl}/${frontMatter.slug}`,
      images: [imageUrl],
      publishedTime: frontMatter.date || undefined,
      modifiedTime: frontMatter.lastmod || frontMatter.date || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: frontMatter.title,
      description: frontMatter.summary || siteMetadata.description,
      images: [imageUrl],
    },
  }
}

export default async function BlogPostPage({ params }) {
  const { slug: slugParts } = await params
  if (
    !Array.isArray(slugParts) ||
    slugParts.length === 0 ||
    slugParts.some((part) => part[0] === '.')
  ) {
    notFound()
  }

  const allPosts = await getAllFilesFrontMatter('blog')
  const slug = slugParts.join('/')
  const postIndex = allPosts.findIndex((post) => formatSlug(post.slug) === slug)
  if (postIndex === -1) {
    notFound()
  }

  const prev = allPosts[postIndex + 1] || null
  const next = allPosts[postIndex - 1] || null
  const post = await getFileBySlug('blog', slug)
  const authorList = post.frontMatter.authors || ['default']
  const authorDetails = await Promise.all(
    authorList.map(async (author) => (await getFileBySlug('authors', author)).frontMatter)
  )

  const { mdxSource, toc, frontMatter } = post

  if (frontMatter.draft === true) {
    return (
      <div className="mt-24 text-center">
        <PageTitle>
          Under Construction{' '}
          <span role="img" aria-label="roadwork sign">
            🚧
          </span>
        </PageTitle>
      </div>
    )
  }

  return (
    <MDXLayoutRenderer
      layout={frontMatter.layout || DEFAULT_LAYOUT}
      toc={toc}
      mdxSource={mdxSource}
      frontMatter={frontMatter}
      authorDetails={authorDetails}
      prev={prev}
      next={next}
    />
  )
}
