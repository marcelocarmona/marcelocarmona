import '@fontsource/inter/index.css'
import '@/css/app.css'

import RootLayoutShell, { metadata } from '../_shared/RootLayoutShell'
import type { ChildrenProps } from '@/types/next'

export { metadata }

export default function SpanishRootLayout({ children }: ChildrenProps) {
  return <RootLayoutShell locale="es">{children}</RootLayoutShell>
}
