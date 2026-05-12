import BlogPostPage, {
  generateBlogPostMetadata,
  generateBlogPostStaticParams,
} from '../../../_shared/BlogPostPage'
import type { SlugPageProps } from '@/types/next'

export function generateStaticParams() {
  return generateBlogPostStaticParams('es')
}

export function generateMetadata(props: SlugPageProps) {
  return generateBlogPostMetadata(props, 'es')
}

export default function SpanishBlogPostPage(props: SlugPageProps) {
  return <BlogPostPage {...props} locale="es" />
}
