import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/inter-tight'
import '@fontsource-variable/spline-sans-mono'
import '@/css/app.css'

import RootLayoutShell, { metadata } from '../_shared/RootLayoutShell'
import type { ChildrenProps } from '@/types/next'

export { metadata }

export default function SpanishRootLayout({ children }: ChildrenProps) {
  return <RootLayoutShell locale="es">{children}</RootLayoutShell>
}
