import { getWatchPath } from './i18n/routes'
import { normalizeLocale } from './locales'
import type { ContentFrontMatter, VideoFrontMatter } from '@/types/content'

export function buildVideoFrontMatter(
  frontmatter: Record<string, any> | null | undefined,
  slug: string
): VideoFrontMatter | null {
  const videoConfig = frontmatter?.video
  const youTubeId = videoConfig?.youtubeId

  if (!youTubeId || !slug) {
    return null
  }

  const uploadDate = videoConfig.uploadDate || frontmatter?.date || null
  const locale = normalizeLocale(frontmatter?.lang)

  return {
    type: 'youtube',
    youTubeId,
    title: videoConfig.title || frontmatter?.title || 'Video',
    description: videoConfig.description || frontmatter?.summary || null,
    uploadDate: uploadDate ? new Date(uploadDate).toISOString() : null,
    embedUrl: `https://www.youtube.com/embed/${youTubeId}`,
    watchUrl: `https://www.youtube.com/watch?v=${youTubeId}`,
    thumbnailUrl: videoConfig.thumbnailUrl || `https://i.ytimg.com/vi/${youTubeId}/hqdefault.jpg`,
    watchPagePath: getWatchPath(locale, slug),
  }
}

export function getVideoPosts<T extends ContentFrontMatter>(posts: T[]): T[] {
  return posts.filter((post) => post.video?.watchPagePath)
}
