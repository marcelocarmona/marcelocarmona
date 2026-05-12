import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import Link from './Link'
import { DisplayTitle, Eyebrow, MutedText } from './ui/typography'
import { getBookPath } from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'
import type { LocaleInput } from '@/types/content'

export default function Footer({ locale = 'en' }: { locale?: LocaleInput }) {
  const { footer } = getUiCopy(locale)

  return (
    <footer className="mt-20 border-t border-border/10 pt-8 dark:border-border-dark/10">
      <div className="flex flex-col gap-8 pb-10 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div>
            <Eyebrow>{footer.eyebrow}</Eyebrow>
            <DisplayTitle as="p" className="mt-2 text-2xl text-gray-900 dark:text-gray-100">
              {footer.title}
            </DisplayTitle>
          </div>
          <MutedText className="max-w-2xl text-sm leading-7">{footer.summary}</MutedText>
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
          <MutedText as="div" className="mb-2 flex space-x-2 text-sm">
            <div>{`© ${new Date().getFullYear()}`}</div>
            <div>{` • `}</div>
            <div>{siteMetadata.author}</div>
          </MutedText>
        </div>
      </div>
    </footer>
  )
}
