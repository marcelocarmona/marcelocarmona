import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import Link from './Link'
import { getBookPath } from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'

export default function Footer({ locale = 'en' }) {
  const { footer } = getUiCopy(locale)

  return (
    <footer className="surface-divider mt-20 border-t pt-8">
      <div className="flex flex-col gap-8 pb-10 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div>
            <p className="eyebrow">Professional focus</p>
            <p className="display-title mt-2 text-2xl text-gray-900 dark:text-gray-100">
              Frontend architecture, performance, and product delivery.
            </p>
          </div>
          <p className="max-w-2xl text-sm leading-7 muted-copy">
            Writing and consulting on React, Next.js, platform architecture, and the engineering
            tradeoffs behind reliable product teams.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end">
          <div className="mb-3 flex space-x-4">
            <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size="6" />
            <SocialIcon kind="github" href={siteMetadata.github} size="6" />
            <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size="6" />
            <SocialIcon kind="twitter" href={siteMetadata.twitter} size="6" />
          </div>
          <div className="mb-3 text-sm font-medium">
            <Link
              href={getBookPath(locale)}
              className="text-primary-600 hover:text-primary-700 dark:hover:text-primary-300"
            >
              {footer.bookCall}
            </Link>
          </div>
          <div className="mb-2 flex space-x-2 text-sm muted-copy">
            <div>{`© ${new Date().getFullYear()}`}</div>
            <div>{` • `}</div>
            <div>{siteMetadata.author}</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
