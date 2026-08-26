import Link from '@/components/Link'
import { Typeset } from '@/components/ui/typography'
import siteMetadata from '@/data/siteMetadata'
import { getTrustPageCopy, type TrustPageKind } from '@/data/trustPages'
import { getBookPath, getContactPath } from '@/lib/i18n/routes'
import type { Locale } from '@/types/content'

const actionCopy: Record<
  Locale,
  { heading: string; email: string; book: string; privacyContact: string }
> = {
  en: {
    heading: 'Contact details',
    email: 'Email Marcelo',
    book: 'Book a call',
    privacyContact: 'Contact Marcelo about privacy',
  },
  es: {
    heading: 'Datos de contacto',
    email: 'Enviar correo a Marcelo',
    book: 'Reservar una llamada',
    privacyContact: 'Contactar a Marcelo sobre privacidad',
  },
}

export default function TrustPage({
  kind,
  locale = 'en',
}: {
  kind: TrustPageKind
  locale?: Locale
}) {
  const copy = getTrustPageCopy(kind, locale)
  const actions = actionCopy[locale]

  return (
    <article lang={locale} className="divide-y divide-border">
      <header className="space-y-5 pb-10 pt-6">
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {copy.title}
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{copy.intro}</p>
      </header>

      <Typeset className="max-w-3xl pb-10 pt-8">
        {copy.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <section>
          <h2>{actions.heading}</h2>
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href={`mailto:${siteMetadata.email}`}>{actions.email}</Link>
            {kind === 'contact' && <Link href={getBookPath(locale)}>{actions.book}</Link>}
            {kind === 'privacy' && (
              <Link href={getContactPath(locale)}>{actions.privacyContact}</Link>
            )}
          </p>
        </section>
      </Typeset>
    </article>
  )
}
