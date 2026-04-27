import WatchPage, {
  generateWatchMetadata,
  generateWatchStaticParams,
} from '../../../_shared/WatchPage'

export function generateStaticParams() {
  return generateWatchStaticParams('en')
}

export function generateMetadata(props) {
  return generateWatchMetadata(props, 'en')
}

export default function EnglishWatchPage(props) {
  return <WatchPage {...props} locale="en" />
}
