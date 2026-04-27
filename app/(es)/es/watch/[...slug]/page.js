import WatchPage, {
  generateWatchMetadata,
  generateWatchStaticParams,
} from '../../../../_shared/WatchPage'

export function generateStaticParams() {
  return generateWatchStaticParams('es')
}

export function generateMetadata(props) {
  return generateWatchMetadata(props, 'es')
}

export default function SpanishWatchPage(props) {
  return <WatchPage {...props} locale="es" />
}
