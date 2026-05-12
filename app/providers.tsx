'use client'

import { ThemeProvider } from 'next-themes'

import Analytics from '@/components/analytics'
import { ClientReload } from '@/components/ClientReload'
import { MDXEmbedProvider } from '@/components/MdxEmbed'
import type { ReactNode } from 'react'

const isDevelopment = process.env.NODE_ENV === 'development'
const isSocket = process.env.SOCKET

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <MDXEmbedProvider>
        {isDevelopment && isSocket && <ClientReload />}
        <Analytics />
        {children}
      </MDXEmbedProvider>
    </ThemeProvider>
  )
}
