import React from 'react'

export const MDXEmbedProvider = ({ children }) => children

export const YouTube = ({ youTubeId, title = 'YouTube video' }) => {
  if (!youTubeId) return null

  return (
    <div className="relative my-6 aspect-video overflow-hidden rounded-lg">
      <iframe
        title={title}
        src={`https://www.youtube.com/embed/${youTubeId}`}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}

export const CodeSandbox = ({ codeSandboxId, title = 'CodeSandbox embed' }) => {
  if (!codeSandboxId) return null

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
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
