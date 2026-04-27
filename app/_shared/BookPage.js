import CalBookingEmbed from '@/components/CalBookingEmbed'
import siteMetadata from '@/data/siteMetadata'

const bookCopy = {
  en: {
    title: 'Book a Call',
    description: "Pick a time that works for you and I'll confirm automatically.",
  },
  es: {
    title: 'Reservar llamada',
    description: 'Elige un horario que funcione para ti y la confirmacion se hara automaticamente.',
  },
}

export default function BookPage({ locale = 'en' }) {
  const copy = bookCopy[locale] || bookCopy.en

  return (
    <div lang={locale} className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="display-title text-3xl font-extrabold leading-9 text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          {copy.title}
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{copy.description}</p>
      </div>

      <div className="pb-8 pt-8">
        <CalBookingEmbed calUrl={siteMetadata.calCom} />
      </div>
    </div>
  )
}
