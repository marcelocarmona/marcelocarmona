import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://0f5a7719db8578beb4bfc17eb4a27171@o196174.ingest.us.sentry.io/4507049833988096',
  tracesSampleRate: 1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
