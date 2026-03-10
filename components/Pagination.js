import Link from '@/components/Link'
import { getBlogPagePath } from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'

export default function Pagination({ totalPages, currentPage, locale = 'en' }) {
  const prevPage = parseInt(currentPage) - 1 > 0
  const nextPage = parseInt(currentPage) + 1 <= parseInt(totalPages)
  const { list } = getUiCopy(locale)

  return (
    <div className="space-y-2 pb-8 pt-6 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button rel="previous" className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            {list.previousPage}
          </button>
        )}
        {prevPage && (
          <Link href={getBlogPagePath(locale, currentPage - 1)}>
            <button rel="previous">{list.previousPage}</button>
          </Link>
        )}
        <span>{list.paginationStatus(currentPage, totalPages)}</span>
        {!nextPage && (
          <button rel="next" className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            {list.nextPage}
          </button>
        )}
        {nextPage && (
          <Link href={getBlogPagePath(locale, currentPage + 1)}>
            <button rel="next">{list.nextPage}</button>
          </Link>
        )}
      </nav>
    </div>
  )
}
