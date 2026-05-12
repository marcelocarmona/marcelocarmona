import Card from '@/components/Card'
import { DisplayTitle } from '@/components/ui/typography'
import projectsData from '@/data/projectsData'
import { buildPageMetadata } from '@/lib/metadata'

const title = 'Projects'
const description = 'Public projects and technical work by Marcelo Carmona.'

export const metadata = {
  ...buildPageMetadata({
    title,
    description,
    path: '/projects',
    locale: 'en',
  }),
  alternates: {
    canonical: '/projects',
  },
}

export default function ProjectsPage() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <DisplayTitle
          as="h1"
          className="text-3xl font-extrabold leading-9 text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14"
        >
          Projects
        </DisplayTitle>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Public work, writing systems, and technical projects I can point to.
        </p>
      </div>
      <div className="container py-12">
        <div className="-m-4 flex flex-wrap">
          {projectsData.map((project) => (
            <Card
              key={project.title}
              title={project.title}
              description={project.description}
              imgSrc={project.imgSrc}
              href={project.href}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
