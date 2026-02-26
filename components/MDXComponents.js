'use client'

import { useMemo } from 'react'
import { getMDXComponent } from 'mdx-bundler/client'
import { YouTube, CodeSandbox } from '@/components/MdxEmbed'
import AuthorLayout from '@/layouts/AuthorLayout'
import PostLayout from '@/layouts/PostLayout'
import PostSimple from '@/layouts/PostSimple'
import Image from './Image'
import CustomLink from './Link'
import TOCInline from './TOCInline'
import Pre from './Pre'
import { BlogNewsletterForm } from './NewsletterForm'

const Layouts = {
  AuthorLayout,
  PostLayout,
  PostSimple,
}

export const MDXComponents = {
  YouTube,
  CodeSandbox,
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm: BlogNewsletterForm,
  wrapper: ({ layout, ...rest }) => {
    const Layout = Layouts[layout] || PostLayout
    return <Layout {...rest} />
  },
}

export const MDXLayoutRenderer = ({ layout, mdxSource, ...rest }) => {
  const MDXLayout = useMemo(() => getMDXComponent(mdxSource), [mdxSource])

  return <MDXLayout layout={layout} components={MDXComponents} {...rest} />
}
