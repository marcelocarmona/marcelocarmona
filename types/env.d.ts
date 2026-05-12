declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_GISCUS_REPO?: string
    NEXT_PUBLIC_GISCUS_REPOSITORY_ID?: string
    NEXT_PUBLIC_GISCUS_CATEGORY?: string
    NEXT_PUBLIC_GISCUS_CATEGORY_ID?: string
    NEXT_PUBLIC_UTTERANCES_REPO?: string
    NEXT_PUBLIC_DISQUS_SHORTNAME?: string
    NEXT_PUBLIC_SENTRY_DSN?: string
    MAILCHIMP_API_KEY?: string
    MAILCHIMP_API_SERVER?: string
    MAILCHIMP_AUDIENCE_ID?: string
    BUTTONDOWN_API_URL?: string
    BUTTONDOWN_API_KEY?: string
    CONVERTKIT_API_URL?: string
    CONVERTKIT_API_KEY?: string
    CONVERTKIT_FORM_ID?: string
    KLAVIYO_API_KEY?: string
    KLAVIYO_LIST_ID?: string
    REVUE_API_URL?: string
    REVUE_API_KEY?: string
    EMAILOCTOPUS_API_URL?: string
    EMAILOCTOPUS_API_KEY?: string
    EMAILOCTOPUS_LIST_ID?: string
  }
}

interface Window {
  dataLayer?: unknown[]
  gtag?: (command: string, action: string, params?: Record<string, unknown>) => void
  plausible?: (eventName: string, ...args: unknown[]) => void
  posthog?: any
  sa_event?: ((eventName: string, callback?: () => void) => void) & { q?: unknown[] }
  Cal?: any
  disqus_config?: () => void
  DISQUS?: {
    reset: (options: { reload: boolean }) => void
  }
  page?: {
    url?: string
    identifier?: string
  }
}
