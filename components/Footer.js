import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import Link from './Link'
import { getBookPath } from '@/lib/i18n/routes'
import { getUiCopy } from '@/lib/i18n/ui'

export default function Footer({ locale = 'en' }) {
  const { footer } = getUiCopy(locale)

  return (
    <footer>
      <div className="mt-16 flex flex-col items-center">
        <div className="mb-3 flex space-x-4">
          <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size="6" />
          <SocialIcon kind="github" href={siteMetadata.github} size="6" />
          <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size="6" />
          <SocialIcon kind="twitter" href={siteMetadata.twitter} size="6" />
        </div>
        <div className="mb-3 text-sm font-medium">
          <Link
            href={getBookPath(locale)}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            {footer.bookCall}
          </Link>
        </div>
        <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>{`© ${new Date().getFullYear()}`}</div>
          <div>{` • `}</div>
          <div>{siteMetadata.author}</div>
        </div>
      </div>
    </footer>
  )
}
