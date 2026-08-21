import Image from './Image'
import Link from './Link'
import type { ProjectData } from '@/types/site'

const Card = ({ title, description, imgSrc, href }: ProjectData) => (
  <div className="p-4 md:w-1/2" style={{ maxWidth: '544px' }}>
    <div
      className={`${imgSrc && 'h-full'} overflow-hidden rounded-lg border border-border bg-card`}
    >
      {imgSrc &&
        (href ? (
          <Link href={href} aria-label={`Link to ${title}`}>
            <Image
              alt={title}
              src={imgSrc}
              className="object-cover object-center md:h-36 lg:h-48"
              width={544}
              height={306}
            />
          </Link>
        ) : (
          <Image
            alt={title}
            src={imgSrc}
            className="object-cover object-center md:h-36 lg:h-48"
            width={544}
            height={306}
          />
        ))}
      <div className="p-6">
        <h2 className="mb-3 font-display text-2xl font-semibold leading-snug tracking-tight text-card-foreground">
          {href ? (
            <Link href={href} aria-label={`Link to ${title}`}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <p className="mb-3 text-muted-foreground">{description}</p>
        {href && (
          <Link
            href={href}
            className="font-mono text-xs uppercase tracking-[0.14em] text-primary transition-colors duration-(--duration-ui) ease-(--ease-out-soft) hover:text-foreground"
            aria-label={`Link to ${title}`}
          >
            Learn more &rarr;
          </Link>
        )}
      </div>
    </div>
  </div>
)

export default Card
