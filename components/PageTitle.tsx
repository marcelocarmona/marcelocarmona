import type { ReactNode } from 'react'

export default function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
      {children}
    </h1>
  )
}
