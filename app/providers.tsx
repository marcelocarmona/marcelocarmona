'use client'

import { ThemeProvider } from 'next-themes'

import Analytics from '@/components/analytics'
import { MDXEmbedProvider } from '@/components/MdxEmbed'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <MDXEmbedProvider>
        <Analytics />
        {children}
      </MDXEmbedProvider>
    </ThemeProvider>
  )
}
