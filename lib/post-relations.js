import { toHreflang } from './locales'
import { getPostPath } from './i18n/routes'

export function getTranslationsForPost(posts, frontMatter) {
  if (!frontMatter.translationKey) {
    return []
  }

  return posts.filter(
    (post) =>
      post.translationKey &&
      post.translationKey === frontMatter.translationKey &&
      post.slug !== frontMatter.slug
  )
}

export function buildLanguageAlternates(posts, frontMatter) {
  const translations = [frontMatter, ...getTranslationsForPost(posts, frontMatter)]
  if (translations.length <= 1) {
    return {}
  }

  const languageAlternates = {}
  translations.forEach((post) => {
    languageAlternates[toHreflang(post.locale)] = getPostPath(post)
  })

  if (languageAlternates['en-US']) {
    languageAlternates['x-default'] = languageAlternates['en-US']
  }

  return languageAlternates
}

export function getRelatedPosts(posts, frontMatter, limit = 3) {
  const targetTags = new Set((frontMatter.tags || []).map((tag) => tag.toLowerCase()))

  return posts
    .filter((post) => post.slug !== frontMatter.slug && post.locale === frontMatter.locale)
    .map((post) => {
      const score = (post.tags || []).reduce((acc, tag) => {
        return targetTags.has(tag.toLowerCase()) ? acc + 1 : acc
      }, 0)

      return { post, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return a.post.date < b.post.date ? 1 : -1
    })
    .slice(0, limit)
    .map((entry) => entry.post)
}
