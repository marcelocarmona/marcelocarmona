'use client'

import { ThemeProvider } from 'next-themes'

import Analytics from '@/components/analytics'
import { ClientReload } from '@/components/ClientReload'
import { MDXEmbedProvider } from '@/components/MdxEmbed'

const isDevelopment = process.env.NODE_ENV === 'development'
const isSocket = process.env.SOCKET

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MDXEmbedProvider>
        {isDevelopment && isSocket && <ClientReload />}
        <Analytics />
        {children}
      </MDXEmbedProvider>
    </ThemeProvider>
  )
}
