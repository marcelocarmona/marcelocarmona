import type { ContentFrontMatter } from '@/types/content'

export const POSTS_PER_PAGE = 5

function getTime(value: string | number | Date | null | undefined): number {
  if (!value) {
    return 0
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

export function hasMeaningfulUpdate(post: Pick<ContentFrontMatter, 'date' | 'lastmod'>): boolean {
  const publishedTime = getTime(post?.date)
  const updatedTime = getTime(post?.lastmod)

  return Boolean(publishedTime && updatedTime && updatedTime > publishedTime)
}
