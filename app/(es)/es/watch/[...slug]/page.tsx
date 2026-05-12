import WatchPage, {
  generateWatchMetadata,
  generateWatchStaticParams,
} from '../../../../_shared/WatchPage'
import type { SlugPageProps } from '@/types/next'

export function generateStaticParams() {
  return generateWatchStaticParams('es')
}

export function generateMetadata(props: SlugPageProps) {
  return generateWatchMetadata(props, 'es')
}

export default function SpanishWatchPage(props: SlugPageProps) {
  return <WatchPage {...props} locale="es" />
}
