import Link from '@/components/Link'
import { getBlogPagePath } from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'

export default function Pagination({ totalPages, currentPage, locale = 'en' }) {
  const prevPage = parseInt(currentPage) - 1 > 0
  const nextPage = parseInt(currentPage) + 1 <= parseInt(totalPages)
  const { list } = getUiCopy(locale)
  const disabledClassName = 'cursor-auto text-gray-400 dark:text-gray-500'
  const linkClassName = 'text-primary-500 hover:text-primary-600 dark:hover:text-primary-400'

  return (
    <div className="space-y-2 pb-8 pt-6 md:space-y-5">
      <nav
        className="flex justify-between"
        aria-label={list.paginationStatus(currentPage, totalPages)}
      >
        {!prevPage ? (
          <span aria-disabled="true" className={disabledClassName}>
            {list.previousPage}
          </span>
        ) : (
          <Link
            href={getBlogPagePath(locale, currentPage - 1)}
            rel="prev"
            className={linkClassName}
          >
            {list.previousPage}
          </Link>
        )}
        <span>{list.paginationStatus(currentPage, totalPages)}</span>
        {!nextPage ? (
          <span aria-disabled="true" className={disabledClassName}>
            {list.nextPage}
          </span>
        ) : (
          <Link
            href={getBlogPagePath(locale, currentPage + 1)}
            rel="next"
            className={linkClassName}
          >
            {list.nextPage}
          </Link>
        )}
      </nav>
    </div>
  )
}
