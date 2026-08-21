import Link from '@/components/Link'

const recoveryLinks = [
  { href: '/', label: 'Home', description: 'Latest technical writing and site overview.' },
  { href: '/blog', label: 'Blog index', description: 'Every English article, paginated.' },
  { href: '/es', label: 'Inicio (Espanol)', description: 'Spanish home and articles.' },
  { href: '/guides', label: 'Guides', description: 'Clustered learning paths by topic.' },
  { href: '/tags', label: 'Tags', description: 'Browse articles by topic tag.' },
]

const machineReadableLinks = [
  {
    href: '/llms.txt',
    label: 'llms.txt',
    description: 'Agent entrypoint and when-to-use guidance.',
  },
  {
    href: '/llms-full.txt',
    label: 'llms-full.txt',
    description: 'Full Markdown index of public content.',
  },
  { href: '/ai-index.json', label: 'ai-index.json', description: 'Structured JSON catalog.' },
  { href: '/sitemap.xml', label: 'sitemap.xml', description: 'Complete URL list.' },
]

const linkClassName = 'font-medium text-primary underline-offset-4 hover:underline'

export default function NotFoundPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col items-start justify-start md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6">
        <div className="space-x-2 pb-8 pt-6 md:space-y-5">
          <h1 className="font-display text-6xl font-semibold leading-none tracking-tight text-foreground md:border-r md:border-border md:px-6 md:text-7xl">
            404
          </h1>
        </div>
        <div className="max-w-md">
          <p className="mb-4 font-display text-xl leading-snug md:text-2xl">
            Sorry we couldn't find this page.
          </p>
          <p className="mb-8 text-muted-foreground">
            But don't worry, you can find plenty of other things on our homepage.
          </p>
          <Link href="/">
            <button className="inline rounded-md bg-primary px-4 py-2 text-sm font-medium leading-5 text-primary-foreground transition-colors duration-(--duration-ui) ease-(--ease-out-soft) hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Back to homepage
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-8 border-t border-border pt-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Where to look next</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {recoveryLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClassName}>
                  {item.label}
                </Link>{' '}
                &mdash; {item.description}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Machine-readable indexes</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {machineReadableLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClassName}>
                  {item.label}
                </Link>{' '}
                &mdash; {item.description}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Article URLs are flat: <code>/{'{slug}'}</code> in English and{' '}
            <code>/es/{'{slug}'}</code> in Spanish. Resolve slugs from the indexes above instead of
            guessing them. Any published URL also serves Markdown via{' '}
            <code>Accept: text/markdown</code> or a <code>.md</code> suffix.
          </p>
        </section>
      </div>
    </div>
  )
}
