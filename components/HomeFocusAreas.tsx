import type { Locale } from '@/types/content'

const focusCopy: Record<
  Locale,
  {
    title: string
    intro: string
    areas: { title: string; description: string }[]
  }
> = {
  en: {
    title: 'What I work on',
    intro:
      'My work connects product experience with the systems and delivery practices that keep it reliable after launch.',
    areas: [
      {
        title: 'Frontend architecture',
        description:
          'React and Next.js applications with accessible interfaces, clear component boundaries, and performance that can be measured instead of guessed.',
      },
      {
        title: 'Cloud and delivery',
        description:
          'Infrastructure and release workflows designed for observable behavior, repeatable deployments, and changes that teams can review with confidence.',
      },
      {
        title: 'Practical AI tooling',
        description:
          'Agent-ready content, automation, and product features that make model behavior easier to understand, verify, and operate safely.',
      },
    ],
  },
  es: {
    title: 'En qué trabajo',
    intro:
      'Mi trabajo conecta la experiencia de producto con los sistemas y prácticas de entrega que lo mantienen confiable después del lanzamiento.',
    areas: [
      {
        title: 'Arquitectura frontend',
        description:
          'Aplicaciones con React y Next.js que tienen interfaces accesibles, límites claros entre componentes y un rendimiento que se puede medir.',
      },
      {
        title: 'Cloud y entrega',
        description:
          'Infraestructura y flujos de publicación pensados para comportamiento observable, despliegues repetibles y cambios que el equipo puede revisar con confianza.',
      },
      {
        title: 'Herramientas prácticas de IA',
        description:
          'Contenido preparado para agentes, automatización y funciones de producto que facilitan comprender, verificar y operar modelos de forma segura.',
      },
    ],
  },
}

export default function HomeFocusAreas({ locale = 'en' }: { locale?: Locale }) {
  const copy = focusCopy[locale]

  return (
    <section aria-labelledby={`${locale}-focus-heading`}>
      <div className="max-w-3xl space-y-3">
        <h2
          id={`${locale}-focus-heading`}
          className="font-display text-2xl font-semibold leading-snug tracking-tight text-foreground"
        >
          {copy.title}
        </h2>
        <p className="leading-7 text-muted-foreground">{copy.intro}</p>
      </div>
      <div className="mt-7 grid gap-8 md:grid-cols-3">
        {copy.areas.map((area) => (
          <article key={area.title} className="border-t border-border pt-5">
            <h3 className="font-display text-lg font-semibold text-foreground">{area.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{area.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
