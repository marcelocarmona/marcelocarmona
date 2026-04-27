import CalBookingEmbed from '@/components/CalBookingEmbed'
import siteMetadata from '@/data/siteMetadata'

export const metadata = {
  title: 'Book a Call',
  description: `Schedule a meeting with ${siteMetadata.author}`,
  alternates: {
    canonical: '/book',
  },
}

export default function BookPage() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="display-title text-3xl font-extrabold leading-9 text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          Book a Call
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Pick a time that works for you and I&apos;ll confirm automatically.
        </p>
      </div>

      <div className="pb-8 pt-8">
        <CalBookingEmbed calUrl={siteMetadata.calCom} />
      </div>
    </div>
  )
}
