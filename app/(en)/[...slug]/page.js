import BlogPostPage, {
  generateBlogPostMetadata,
  generateBlogPostStaticParams,
} from '../../_shared/BlogPostPage'

export function generateStaticParams() {
  return generateBlogPostStaticParams('en')
}

export function generateMetadata(props) {
  return generateBlogPostMetadata(props, 'en')
}

export default function EnglishBlogPostPage(props) {
  return <BlogPostPage {...props} locale="en" />
}
