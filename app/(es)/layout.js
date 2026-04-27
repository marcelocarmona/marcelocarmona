import '@fontsource/inter/index.css'
import '@/css/app.css'

import RootLayoutShell, { metadata } from '../_shared/RootLayoutShell'

export { metadata }

export default function SpanishRootLayout({ children }) {
  return <RootLayoutShell locale="es">{children}</RootLayoutShell>
}
