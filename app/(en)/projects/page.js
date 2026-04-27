import Card from '@/components/Card'
import projectsData from '@/data/projectsData'
import siteMetadata from '@/data/siteMetadata'

export const metadata = {
  title: 'Projects',
  description: siteMetadata.description,
  alternates: {
    canonical: '/projects',
  },
}

export default function ProjectsPage() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="display-title text-3xl font-extrabold leading-9 text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          Projects
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Showcase your projects with a hero image (16 x 9)
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
