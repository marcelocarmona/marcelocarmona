import Mail from './mail.svg'
import Github from './github.svg'
import Facebook from './facebook.svg'
import Youtube from './youtube.svg'
import Linkedin from './linkedin.svg'
import Twitter from './twitter.svg'

// Icons taken from: https://simpleicons.org/

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
}

type SocialIconKind = keyof typeof components
const iconSizeClassNames: Record<string, string> = {
  '6': 'size-6',
  '8': 'size-8',
}

const SocialIcon = ({
  kind,
  href,
  size = 8,
}: {
  kind: SocialIconKind
  href?: string
  size?: number | string
}) => {
  if (!href || (kind === 'mail' && !/^mailto:\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(href)))
    return null

  const SocialSvg = components[kind]
  const sizeClassName = iconSizeClassNames[String(size)] ?? iconSizeClassNames['8']

  return (
    <a
      className="text-sm text-muted-foreground transition hover:text-muted-foreground"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={`fill-current text-muted-foreground transition-colors duration-(--duration-ui) ease-(--ease-out-soft) hover:text-primary ${sizeClassName}`}
      />
    </a>
  )
}

export default SocialIcon
