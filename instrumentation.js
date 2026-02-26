import * as Sentry from '@sentry/nextjs'

const dsn = 'https://0f5a7719db8578beb4bfc17eb4a27171@o196174.ingest.us.sentry.io/4507049833988096'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn,
      tracesSampleRate: 1,
      debug: false,
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,
      tracesSampleRate: 1,
      debug: false,
    })
  }
}

export const onRequestError = Sentry.captureRequestError
