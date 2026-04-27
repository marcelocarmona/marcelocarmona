import '@fontsource/inter/index.css'
import '@/css/app.css'

import RootLayoutShell, { metadata } from '../_shared/RootLayoutShell'

export { metadata }

export default function EnglishRootLayout({ children }) {
  return <RootLayoutShell locale="en">{children}</RootLayoutShell>
}
