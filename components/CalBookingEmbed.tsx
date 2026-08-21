'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import siteMetadata from '@/data/siteMetadata'
import { logEvent } from '@/components/analytics/GoogleAnalytics'
import Link from '@/components/Link'
import { mountCalInline, normalizeCalLink } from '@/lib/integrations/cal'

const CAL_CONTAINER_ID = 'cal-booking-inline'

export default function CalBookingEmbed({ calUrl = siteMetadata.calCom }: { calUrl?: string }) {
  const [hasEmbedError, setHasEmbedError] = useState(false)
  const didInitRef = useRef(false)
  const hostedCalUrl = calUrl || siteMetadata.calCom || 'https://cal.com'

  const calLink = useMemo(() => normalizeCalLink(hostedCalUrl), [hostedCalUrl])

  useEffect(() => {
    if (didInitRef.current || !calLink || typeof window === 'undefined') {
      return
    }

    try {
      setHasEmbedError(false)
      mountCalInline({
        calLink,
        elementOrSelector: `#${CAL_CONTAINER_ID}`,
        layout: 'month_view',
        theme: 'auto',
        onReady: () => {
          logEvent('cal_embed_ready', 'cal.com', calLink)
        },
        onBookingSuccess: () => {
          logEvent('cal_booking_success', 'cal.com', calLink, 1)
        },
      })
      didInitRef.current = true
      logEvent('cal_embed_loaded', 'cal.com', calLink)
    } catch {
      setHasEmbedError(true)
      logEvent('cal_embed_error', 'cal.com', calLink)
    }
  }, [calLink])

  const showFallback = hasEmbedError || !calLink

  return (
    <section className="space-y-4">
      <div id={CAL_CONTAINER_ID} className="w-full overflow-hidden" />

      <p className="text-sm text-muted-foreground">
        Prefer the hosted page?{' '}
        <Link
          href={hostedCalUrl}
          className="text-primary underline-offset-4 hover:underline"
          onClick={() => logEvent('cal_fallback_click', 'cal.com', calLink)}
        >
          Open {hostedCalUrl.replace(/^https?:\/\//, '')}
        </Link>
        .
      </p>

      {showFallback && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
          The inline scheduler could not load in this browser. Use the hosted booking link above.
        </div>
      )}
    </section>
  )
}
