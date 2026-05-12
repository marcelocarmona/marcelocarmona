import WatchPage, {
  generateWatchMetadata,
  generateWatchStaticParams,
} from '../../../_shared/WatchPage'
import type { SlugPageProps } from '@/types/next'

export function generateStaticParams() {
  return generateWatchStaticParams('en')
}

export function generateMetadata(props: SlugPageProps) {
  return generateWatchMetadata(props, 'en')
}

export default function EnglishWatchPage(props: SlugPageProps) {
  return <WatchPage {...props} locale="en" />
}
