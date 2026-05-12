import '@fontsource/inter/index.css'
import '@/css/app.css'

import RootLayoutShell, { metadata } from '../_shared/RootLayoutShell'
import type { ChildrenProps } from '@/types/next'

export { metadata }

export default function EnglishRootLayout({ children }: ChildrenProps) {
  return <RootLayoutShell locale="en">{children}</RootLayoutShell>
}
