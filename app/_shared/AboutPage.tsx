import Image from '@/components/Image'
import Link from '@/components/Link'
import SocialIcon from '@/components/social-icons'
import siteMetadata from '@/data/siteMetadata'
import { getBookPath } from '@/lib/i18n/routes'
import type { Locale } from '@/types/content'

const aboutCopy: Record<
  Locale,
  {
    title: string
    intro: string
    body: string
    connect: string
    cta: string
    occupation: string
  }
> = {
  en: {
    title: 'About',
    intro:
      'Hello there, I am Marcelo Carmona, a software engineer focused on frontend architecture, React, Next.js, and performance-minded product delivery.',
    body: 'I enjoy turning complex product problems into maintainable systems, and I like sharing the engineering tradeoffs behind that work through articles and practical guides.',
    connect:
      'If you are interested in connecting, you can book a call or find me on the channels below.',
    cta: 'Book a call',
    occupation: 'Software engineer',
  },
  es: {
    title: 'Acerca de mi',
    intro:
      'Hola, soy Marcelo Carmona, ingeniero de software enfocado en arquitectura frontend, React, Next.js y rendimiento web.',
    body: 'Me gusta convertir problemas complejos de producto en sistemas mantenibles, y compartir las decisiones tecnicas detras de ese trabajo en articulos y guias practicas.',
    connect:
      'Si quieres conversar, puedes reservar una llamada o encontrarme en los canales de abajo.',
    cta: 'Reservar llamada',
    occupation: 'Ingeniero de software',
  },
}

export default function AboutPage({ locale = 'en' }: { locale?: Locale }) {
  const copy = aboutCopy[locale]

  return (
    <div lang={locale} className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          {copy.title}
        </h1>
      </div>
      <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
        <div className="flex flex-col items-center pt-8">
          <Image
            src="/static/images/marcelo.jpg"
            alt="Marcelo Carmona"
            width={192}
            height={192}
            className="h-48 w-48 rounded-full"
          />
          <h2 className="pb-1 pt-4 text-2xl font-bold leading-8 tracking-tight">
            {siteMetadata.author}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{copy.occupation}</p>
          <div className="flex space-x-3 pt-6">
            <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} />
            <SocialIcon kind="github" href={siteMetadata.github} />
            <SocialIcon kind="linkedin" href={siteMetadata.linkedin} />
            <SocialIcon kind="twitter" href={siteMetadata.twitter} />
          </div>
        </div>
        <div className="prose max-w-none pb-8 pt-8 dark:prose-dark xl:col-span-2">
          <p>{copy.intro}</p>
          <p>{copy.body}</p>
          <p>{copy.connect}</p>
          <p>
            <Link href={getBookPath(locale)}>{copy.cta}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
