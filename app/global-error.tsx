'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    // No ThemeProvider runs here: global-error replaces the root layout. The
    // semantic tokens still resolve because `:root` defines them unconditionally,
    // so this must not use a hardcoded light background with a `dark:` text color.
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <main className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-3 text-muted-foreground">
            An unexpected error occurred in the App Router layer.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors duration-(--duration-ui) ease-(--ease-out-soft) hover:bg-primary/90"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
