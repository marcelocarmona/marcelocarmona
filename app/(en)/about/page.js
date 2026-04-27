import { MDXLayoutRenderer } from '@/components/MDXComponents'
import siteMetadata from '@/data/siteMetadata'
import { getFileBySlug } from '@/lib/mdx'

const DEFAULT_LAYOUT = 'AuthorLayout'

export const metadata = {
  title: 'About',
  description: `About me - ${siteMetadata.author}`,
  alternates: {
    canonical: '/about',
  },
}

export default async function AboutPage() {
  const authorDetails = await getFileBySlug('authors', 'default')
  const { mdxSource, frontMatter } = authorDetails

  return (
    <MDXLayoutRenderer
      layout={frontMatter.layout || DEFAULT_LAYOUT}
      mdxSource={mdxSource}
      frontMatter={frontMatter}
    />
  )
}
