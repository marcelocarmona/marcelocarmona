import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export const MDXEmbedProvider = ({ children }: { children: ReactNode }) => children

export const YouTubePlayer = ({
  youTubeId,
  title = 'YouTube video',
  className,
}: {
  youTubeId?: string
  title?: string
  className?: string
}) => {
  if (!youTubeId) return null

  const embedUrl = `https://www.youtube.com/embed/${youTubeId}`

  return (
    <div className={cn('relative my-6 aspect-video overflow-hidden rounded-lg', className)}>
      <iframe
        title={title}
        src={embedUrl}
        className="absolute inset-0 size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}

export const CodeSandbox = ({
  codeSandboxId,
  title = 'CodeSandbox embed',
}: {
  codeSandboxId?: string
  title?: string
}) => {
  if (!codeSandboxId) return null

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border">
      <iframe
        title={title}
        src={`https://codesandbox.io/embed/${codeSandboxId}?fontsize=14&hidenavigation=1&theme=dark`}
        className="h-[500px] w-full"
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  )
}
