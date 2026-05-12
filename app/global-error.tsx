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
    <html lang="en">
      <body className="bg-white text-black antialiased dark:bg-gray-900 dark:text-white">
        <main className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            An unexpected error occurred in the App Router layer.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-sm bg-primary-600 px-4 py-2 text-white hover:bg-primary-500"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
