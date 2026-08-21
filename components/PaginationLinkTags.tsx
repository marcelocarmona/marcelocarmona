import { getBlogPagePath } from '@/lib/i18n/routes'
import { absoluteUrl } from '@/lib/metadata'
import type { LocaleInput } from '@/types/content'

/**
 * Emits `<link rel="prev">` / `<link rel="next">` for paginated archives so
 * crawlers and agents can traverse past the first page. React hoists these into
 * `<head>`; the Metadata API has no field for arbitrary link relations.
 */
export default function PaginationLinkTags({
  currentPage,
  totalPages,
  locale = 'en',
}: {
  currentPage: number
  totalPages: number
  locale?: LocaleInput
}) {
  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <>
      {hasPrevious && (
        <link rel="prev" href={absoluteUrl(getBlogPagePath(locale, currentPage - 1))} />
      )}
      {hasNext && <link rel="next" href={absoluteUrl(getBlogPagePath(locale, currentPage + 1))} />}
    </>
  )
}
