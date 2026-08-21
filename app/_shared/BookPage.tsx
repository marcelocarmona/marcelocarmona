import CalBookingEmbed from '@/components/CalBookingEmbed'
import { DisplayTitle } from '@/components/ui/typography'
import siteMetadata from '@/data/siteMetadata'
import type { Locale } from '@/types/content'

const bookCopy: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'Book a Call',
    description: "Pick a time that works for you and I'll confirm automatically.",
  },
  es: {
    title: 'Reservar llamada',
    description: 'Elige un horario que funcione para ti y la confirmacion se hara automaticamente.',
  },
}

export default function BookPage({ locale = 'en' }: { locale?: Locale }) {
  const copy = bookCopy[locale]

  return (
    <div lang={locale} className="divide-y divide-border">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <DisplayTitle
          as="h1"
          className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl"
        >
          {copy.title}
        </DisplayTitle>
        <p className="text-lg leading-7 text-muted-foreground">{copy.description}</p>
      </div>

      <div className="pb-8 pt-8">
        <CalBookingEmbed calUrl={siteMetadata.calCom} />
      </div>
    </div>
  )
}
