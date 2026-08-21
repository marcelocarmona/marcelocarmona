import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'
import { Typeset } from '@/components/ui/typography'
import siteMetadata from '@/data/siteMetadata'
import type { AuthorFrontMatter } from '@/types/content'
import type { ReactNode } from 'react'

export default function AuthorLayout({
  children,
  frontMatter,
}: {
  children: ReactNode
  frontMatter: AuthorFrontMatter
}) {
  const { name, avatar, occupation, company, email, twitter, linkedin, github } = frontMatter

  return (
    <div className="divide-y divide-border">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
          About
        </h1>
      </div>
      <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
        <div className="flex flex-col items-center pt-8">
          <Image
            src={avatar || siteMetadata.image}
            alt="avatar"
            width={192}
            height={192}
            className="h-48 w-48 rounded-full"
          />
          <h3 className="pb-2 pt-4 font-display text-2xl font-semibold leading-snug tracking-tight">
            {name}
          </h3>
          <div className="flex space-x-3 pt-6">
            <SocialIcon kind="mail" href={`mailto:${email}`} />
            <SocialIcon kind="github" href={github} />
            <SocialIcon kind="linkedin" href={linkedin} />
            <SocialIcon kind="twitter" href={twitter} />
          </div>
        </div>
        <Typeset className="pb-8 pt-8 xl:col-span-2">{children}</Typeset>
      </div>
    </div>
  )
}
