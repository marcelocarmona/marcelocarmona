'use client'

import HoverPrefetchLink from '@/components/HoverPrefetchLink'
import Tag from '@/components/Tag'
import { Typeset } from '@/components/ui/typography'
import { useState } from 'react'
import Pagination from '@/components/Pagination'
import { getPostPath } from '@/lib/i18n/routes'
import { normalizeLocale } from '@/lib/i18n/config'
import { getUiCopy } from '@/lib/i18n/ui'
import { hasMeaningfulUpdate } from '@/lib/posts'
import formatDate from '@/lib/utils/formatDate'
import type { ContentFrontMatter, LocaleInput, Pagination as PaginationData } from '@/types/content'

interface ListLayoutProps {
  posts: ContentFrontMatter[]
  title: string
  locale?: LocaleInput
  initialDisplayPosts?: ContentFrontMatter[]
  pagination?: PaginationData
}

export default function ListLayout({
  posts,
  title,
  locale = 'en',
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const [searchValue, setSearchValue] = useState('')
  const resolvedLocale = normalizeLocale(locale)
  const { list } = getUiCopy(resolvedLocale)
  const filteredBlogPosts = posts.filter((frontMatter) => {
    const searchContent =
      (frontMatter.title || '') + (frontMatter.summary || '') + (frontMatter.tags || []).join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  return (
    <>
      <div lang={resolvedLocale} className="divide-y divide-border">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <div className="relative max-w-lg">
            <input
              aria-label={list.searchArticles}
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={list.searchArticles}
              className="block w-full rounded-md border border-border bg-card px-4 py-2 text-foreground focus:border-primary focus:ring-ring"
            />
            <svg
              className="absolute right-3 top-3 h-5 w-5 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <ul>
          {!filteredBlogPosts.length && list.noPostsFound}
          {displayPosts.map((frontMatter) => {
            const { slug, date, lastmod, title, summary, tags } = frontMatter
            return (
              <li key={slug} className="py-4">
                <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                  <dl className="space-y-1">
                    <dt className="sr-only">{list.publishedOn}</dt>
                    <dd className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <time dateTime={date || undefined}>{formatDate(date, resolvedLocale)}</time>
                    </dd>
                    {hasMeaningfulUpdate(frontMatter) && (
                      <>
                        <dt className="sr-only">{list.updatedOn}</dt>
                        <dd className="font-mono text-xs text-muted-foreground">
                          {list.updatedOn}{' '}
                          <time dateTime={lastmod || undefined}>
                            {formatDate(lastmod, resolvedLocale)}
                          </time>
                        </dd>
                      </>
                    )}
                  </dl>
                  <div className="space-y-3 xl:col-span-3">
                    <div>
                      <h3 className="font-display text-2xl font-semibold leading-snug tracking-tight">
                        <HoverPrefetchLink
                          href={getPostPath(resolvedLocale, slug)}
                          className="text-foreground"
                        >
                          {title}
                        </HoverPrefetchLink>
                      </h3>
                      <div className="flex flex-wrap">
                        {(tags || []).map((tag) => (
                          <Tag key={tag} locale={resolvedLocale} text={tag} />
                        ))}
                      </div>
                    </div>
                    <Typeset variant="note">{summary}</Typeset>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination
          currentPage={pagination.currentPage}
          locale={resolvedLocale}
          totalPages={pagination.totalPages}
        />
      )}
    </>
  )
}
