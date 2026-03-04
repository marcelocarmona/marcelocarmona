'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import siteMetadata from '@/data/siteMetadata'
import { logEvent } from '@/components/analytics/GoogleAnalytics'
import Link from '@/components/Link'

const CAL_SCRIPT_SRC = 'https://app.cal.com/embed/embed.js'
const CAL_ORIGIN = 'https://cal.com'
const CAL_CONTAINER_ID = 'cal-booking-inline'
const CAL_INIT_ACTION = 'init'

const normalizeCalLink = (calUrl) => {
  if (!calUrl) return ''

  try {
    const parsedUrl = new URL(calUrl)
    return parsedUrl.pathname.replace(/^\/+|\/+$/g, '')
  } catch {
    return calUrl.replace(/^https?:\/\/(www\.)?cal\.com\//i, '').replace(/^\/+|\/+$/g, '')
  }
}

const ensureCalLoader = () => {
  if (typeof window === 'undefined') return null

  if (typeof window.Cal === 'function') {
    return window.Cal
  }

  ;((C, A, L) => {
    const queuePush = (api, args) => {
      api.q.push(args)
    }

    const d = C.document
    C.Cal =
      C.Cal ||
      function () {
        const cal = C.Cal
        const args = arguments

        if (!cal.loaded) {
          cal.ns = {}
          cal.q = cal.q || []

          const scriptElement = d.createElement('script')
          scriptElement.src = A
          scriptElement.async = true
          d.head.appendChild(scriptElement)
          cal.loaded = true
        }

        if (args[0] === L) {
          const api = function () {
            queuePush(api, arguments)
          }
          const namespace = args[1]
          api.q = api.q || []

          if (typeof namespace === 'string') {
            cal.ns[namespace] = cal.ns[namespace] || api
            queuePush(cal.ns[namespace], args)
            queuePush(cal, ['initNamespace', namespace])
          } else {
            queuePush(cal, args)
          }
          return
        }

        queuePush(cal, args)
      }
  })(window, CAL_SCRIPT_SRC, CAL_INIT_ACTION)

  return window.Cal
}

export default function CalBookingEmbed({ calUrl = siteMetadata.calCom }) {
  const [hasEmbedError, setHasEmbedError] = useState(false)
  const didInitRef = useRef(false)
  const hostedCalUrl = calUrl || siteMetadata.calCom || 'https://cal.com'

  const calLink = useMemo(() => normalizeCalLink(hostedCalUrl), [hostedCalUrl])

  useEffect(() => {
    if (didInitRef.current || !calLink || typeof window === 'undefined') {
      return
    }

    const Cal = ensureCalLoader()
    if (!Cal || typeof Cal !== 'function') {
      setHasEmbedError(true)
      return
    }

    try {
      setHasEmbedError(false)
      Cal('init', { origin: CAL_ORIGIN })
      Cal('inline', {
        calLink,
        elementOrSelector: `#${CAL_CONTAINER_ID}`,
        config: {
          layout: 'month_view',
        },
      })
      Cal('ui', {
        hideEventTypeDetails: false,
        layout: 'month_view',
        theme: 'auto',
      })
      Cal('on', {
        action: 'bookerReady',
        callback: () => {
          logEvent('cal_embed_ready', 'cal.com', calLink)
        },
      })
      Cal('on', {
        action: 'bookingSuccessfulV2',
        callback: () => {
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

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Prefer the hosted page?{' '}
        <Link
          href={hostedCalUrl}
          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
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
