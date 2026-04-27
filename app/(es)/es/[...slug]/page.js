import BlogPostPage, {
  generateBlogPostMetadata,
  generateBlogPostStaticParams,
} from '../../../_shared/BlogPostPage'

export function generateStaticParams() {
  return generateBlogPostStaticParams('es')
}

export function generateMetadata(props) {
  return generateBlogPostMetadata(props, 'es')
}

export default function SpanishBlogPostPage(props) {
  return <BlogPostPage {...props} locale="es" />
}
