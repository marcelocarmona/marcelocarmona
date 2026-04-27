const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const tracesSampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1')
let sentryPromise

function loadSentry() {
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

export const onRouterTransitionStart = (...args) => {
  loadSentry()?.then((Sentry) => {
    Sentry.captureRouterTransitionStart(...args)
  })
}
