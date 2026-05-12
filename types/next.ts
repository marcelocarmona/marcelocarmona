import type { ReactNode } from 'react'

export interface ChildrenProps {
  children: ReactNode
}

export interface SlugPageProps {
  params: Promise<{
    slug: string[]
  }>
}

export interface PageNumberProps {
  params: Promise<{
    page: string
  }>
}

export interface TagPageProps {
  params: Promise<{
    tag: string
  }>
}
