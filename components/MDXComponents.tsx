'use client'

import { useMemo } from 'react'
import type { ComponentType } from 'react'
import { getMDXComponent } from 'mdx-bundler/client'
import dynamic from 'next/dynamic'
import { CodeSandbox } from '@/components/MdxEmbed'
import AuthorLayout from '@/layouts/AuthorLayout'
import PostLayout from '@/layouts/PostLayout'
import PostSimple from '@/layouts/PostSimple'
import Image from './Image'
import CustomLink from './Link'
import TOCInline from './TOCInline'
import Pre from './Pre'
import { BlogNewsletterForm } from './NewsletterForm'

const Layouts: Record<string, ComponentType<any>> = {
  AuthorLayout,
  PostLayout,
  PostSimple,
}

// Keep complex, article-specific visualizations out of the baseline blog bundle.
// `next/dynamic` uses the site's React runtime and still server-renders by default.
const HashRingDemo = dynamic(() => import('./diagrams/HashRingDemo'))
const QuorumDemo = dynamic(() => import('./diagrams/QuorumDemo'))
const TailLatencyDemo = dynamic(() => import('./diagrams/TailLatencyDemo'))

// Same idea for the KaTeX stylesheet: only posts that actually render math pay for it.
const MathStyles = dynamic(() => import('./MathStyles'))

const BaseMDXComponents = {
  CodeSandbox,
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm: BlogNewsletterForm,
  HashRingDemo,
  QuorumDemo,
  TailLatencyDemo,
  wrapper: ({ layout, ...rest }: { layout: string; [key: string]: any }) => {
    const Layout = Layouts[layout] || PostLayout
    return (
      <>
        {rest.frontMatter?.hasMath && <MathStyles />}
        <Layout {...rest} />
      </>
    )
  },
}

export const MDXLayoutRenderer = ({
  layout,
  mdxSource,
  ...rest
}: {
  layout: string
  mdxSource: string
  [key: string]: any
}) => {
  const MDXLayout = useMemo(() => getMDXComponent(mdxSource), [mdxSource])

  return <MDXLayout layout={layout} components={BaseMDXComponents} {...rest} />
}
