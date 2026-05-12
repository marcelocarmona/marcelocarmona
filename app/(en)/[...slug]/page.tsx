import BlogPostPage, {
  generateBlogPostMetadata,
  generateBlogPostStaticParams,
} from '../../_shared/BlogPostPage'
import type { SlugPageProps } from '@/types/next'

export function generateStaticParams() {
  return generateBlogPostStaticParams('en')
}

export function generateMetadata(props: SlugPageProps) {
  return generateBlogPostMetadata(props, 'en')
}

export default function EnglishBlogPostPage(props: SlugPageProps) {
  return <BlogPostPage {...props} locale="en" />
}
