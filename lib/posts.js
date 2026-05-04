export const POSTS_PER_PAGE = 5

function getTime(value) {
  if (!value) {
    return 0
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

export function hasMeaningfulUpdate(post) {
  const publishedTime = getTime(post?.date)
  const updatedTime = getTime(post?.lastmod)

  return Boolean(publishedTime && updatedTime && updatedTime > publishedTime)
}
