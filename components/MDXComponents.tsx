'use client'

import { useMemo } from 'react'
import type { ComponentType } from 'react'
import { getMDXComponent } from 'mdx-bundler/client'
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

const BaseMDXComponents = {
  CodeSandbox,
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm: BlogNewsletterForm,
  wrapper: ({ layout, ...rest }: { layout: string; [key: string]: any }) => {
    const Layout = Layouts[layout] || PostLayout
    return <Layout {...rest} />
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
