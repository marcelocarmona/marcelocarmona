import Link from '@/components/Link'
import Image from '@/components/Image'
import { getUiCopy } from '@/lib/i18n/ui'
import type { LocaleInput, VideoFrontMatter } from '@/types/content'

export default function VideoPreviewCard({
  video,
  locale = 'en',
}: {
  video?: VideoFrontMatter | null
  locale?: LocaleInput
}) {
  if (!video) {
    return null
  }

  const { video: videoUi } = getUiCopy(locale)
  const description = video.description || videoUi.articleHelper

  return (
    <div className="not-typeset my-8 overflow-hidden rounded-lg border border-border bg-card">
      <Link href={video.watchPagePath} className="group relative block bg-foreground">
        <div className="relative aspect-video overflow-hidden md:aspect-[16/7.5]">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(min-width: 1280px) 896px, (min-width: 768px) 704px, 100vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center rounded-full bg-card/90 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
              {videoUi.watchPageLabel}
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-card/90 text-foreground transition-transform duration-(--duration-ui) ease-(--ease-out-soft) group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-col gap-6 p-6 md:p-7">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {videoUi.articleEyebrow}
          </p>
          <h2 className="text-xl font-semibold text-foreground">{video.title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={video.watchPagePath}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-(--duration-ui) ease-(--ease-out-soft) hover:bg-primary/90"
          >
            {videoUi.watchPageCta}
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M11.78 4.22a.75.75 0 0 0 0 1.06l3.97 3.97H3.75a.75.75 0 0 0 0 1.5h12l-3.97 3.97a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06l-5.25-5.25a.75.75 0 0 0-1.06 0Z" />
            </svg>
          </Link>
          <Link
            href={video.watchUrl}
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary dark:hover:border-primary"
          >
            {videoUi.watchOnYouTube}
          </Link>
        </div>
      </div>
    </div>
  )
}
