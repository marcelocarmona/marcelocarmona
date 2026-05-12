const CAL_SCRIPT_SRC = 'https://app.cal.com/embed/embed.js'
const CAL_ORIGIN = 'https://cal.com'
const CAL_INIT_ACTION = 'init'

type CalApi = {
  (...args: any[]): void
  loaded?: boolean
  ns?: Record<string, CalApi>
  q: Array<IArguments | any[]>
}

interface MountCalInlineOptions {
  calLink: string
  elementOrSelector: string | HTMLElement
  layout?: string
  theme?: string
  hideEventTypeDetails?: boolean
  onReady?: () => void
  onBookingSuccess?: () => void
}

export function normalizeCalLink(calUrl?: string | null): string {
  if (!calUrl) {
    return ''
  }

  try {
    const parsedUrl = new URL(calUrl)
    return parsedUrl.pathname.replace(/^\/+|\/+$/g, '')
  } catch {
    return calUrl.replace(/^https?:\/\/(www\.)?cal\.com\//i, '').replace(/^\/+|\/+$/g, '')
  }
}

function ensureCalLoader(): CalApi | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (typeof window.Cal === 'function') {
    return window.Cal
  }

  ;((C: Window, A: string, L: string) => {
    const queuePush = (api: CalApi, args: IArguments | any[]) => {
      api.q.push(args)
    }

    const d = C.document
    C.Cal =
      C.Cal ||
      function (this: unknown) {
        const cal = C.Cal as CalApi
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
          const api: CalApi = function () {
            queuePush(api, arguments)
          } as CalApi
          const namespace = args[1]
          api.q = api.q || []

          if (typeof namespace === 'string') {
            cal.ns = cal.ns || {}
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

export function mountCalInline({
  calLink,
  elementOrSelector,
  layout = 'month_view',
  theme = 'auto',
  hideEventTypeDetails = false,
  onReady,
  onBookingSuccess,
}: MountCalInlineOptions): CalApi {
  const Cal = ensureCalLoader()
  if (!Cal || typeof Cal !== 'function') {
    throw new Error('Cal embed loader unavailable')
  }

  Cal('init', { origin: CAL_ORIGIN })
  Cal('inline', {
    calLink,
    elementOrSelector,
    config: {
      layout,
    },
  })
  Cal('ui', {
    hideEventTypeDetails,
    layout,
    theme,
  })

  if (typeof onReady === 'function') {
    Cal('on', {
      action: 'bookerReady',
      callback: onReady,
    })
  }

  if (typeof onBookingSuccess === 'function') {
    Cal('on', {
      action: 'bookingSuccessfulV2',
      callback: onBookingSuccess,
    })
  }

  return Cal
}
