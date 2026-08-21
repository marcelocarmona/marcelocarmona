'use client'

import { useRef, useState } from 'react'
import type { FormEvent } from 'react'

import siteMetadata from '@/data/siteMetadata'
import type { NewsletterResponse } from '@/types/content'

const NewsletterForm = ({ title = 'Subscribe to the newsletter' }: { title?: string }) => {
  const inputEl = useRef<HTMLInputElement>(null)
  const [error, setError] = useState(false)
  const [message, setMessage] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const subscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputEl.current) {
      return
    }

    const res = await fetch(`/api/${siteMetadata.newsletter.provider}`, {
      body: JSON.stringify({
        email: inputEl.current.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const { error } = (await res.json()) as NewsletterResponse
    if (error) {
      setError(true)
      setMessage('Your e-mail address is invalid or you are already subscribed!')
      return
    }

    inputEl.current.value = ''
    setError(false)
    setSubscribed(true)
    setMessage('Successfully! 🎉 You are now subscribed.')
  }

  return (
    <div>
      <div className="pb-1 text-lg font-semibold text-foreground">{title}</div>
      <form className="flex flex-col sm:flex-row" onSubmit={subscribe}>
        <div>
          <label className="sr-only" htmlFor="email-input">
            Email address
          </label>
          <input
            autoComplete="email"
            className="w-72 rounded-md border border-border bg-card px-4 text-foreground focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-ring [&:-webkit-autofill]:duration-[600000s] [&:-webkit-autofill]:transition-colors"
            id="email-input"
            name="email"
            placeholder={subscribed ? "You're subscribed !  🎉" : 'Enter your email'}
            ref={inputEl}
            required
            type="email"
            disabled={subscribed}
          />
        </div>
        <div className="mt-2 flex w-full rounded-md shadow-xs sm:ml-3 sm:mt-0">
          <button
            className={`w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground sm:py-0 ${
              subscribed ? 'cursor-default' : 'hover:bg-primary dark:hover:bg-primary'
            } focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:ring-offset-black`}
            type="submit"
            disabled={subscribed}
          >
            {subscribed ? 'Thank you!' : 'Sign up'}
          </button>
        </div>
      </form>
      {error && <div className="w-72 pt-2 text-sm text-destructive sm:w-96">{message}</div>}
    </div>
  )
}

export default NewsletterForm

export const BlogNewsletterForm = ({ title }: { title?: string }) => (
  <div className="flex items-center justify-center">
    <div className="bg-muted p-6 sm:px-14 sm:py-8">
      <NewsletterForm title={title} />
    </div>
  </div>
)
