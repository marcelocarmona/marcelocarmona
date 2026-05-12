const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const tracesSampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1')
let sentryPromise: Promise<typeof import('@sentry/nextjs')> | null = null

function loadSentry(): Promise<typeof import('@sentry/nextjs')> | null {
  if (!dsn) return null
  sentryPromise ??= import('@sentry/nextjs')
  return sentryPromise
}

loadSentry()?.then((Sentry) => {
  Sentry.init({
    dsn,
    tracesSampleRate,
    debug: false,
  })
})

export const onRouterTransitionStart = (
  ...args: Parameters<typeof import('@sentry/nextjs').captureRouterTransitionStart>
) => {
  loadSentry()?.then((Sentry) => {
    Sentry.captureRouterTransitionStart(...args)
  })
}
