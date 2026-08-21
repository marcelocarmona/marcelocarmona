import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'
import vitesseDark from 'shiki/themes/vitesse-dark.mjs'
import type { ContentFrontMatter, MdxFile, TocHeading } from '@/types/content'
import { normalizeLocale } from './locales'
import getAllFilesRecursively from './utils/files'
import remarkExtractFrontmatter from './remark-extract-frontmatter'
import remarkTocHeadings from './remark-toc-headings'
import remarkImgToJsx from './remark-img-to-jsx'
import { buildVideoFrontMatter } from './video'

const root = process.cwd()

/*
 * Shiki runs at build time, so no highlighter ships to the browser.
 *
 * `defaultColor: false` stops Shiki writing inline colors and emits
 * `--shiki-light` / `--shiki-dark` per token instead, which hands the palette to
 * css/shiki.css. `langs` is pinned to what the posts actually use rather than
 * pulling the full grammar bundle.
 *
 * Three vitesse-dark colors fail WCAG AA against the block surface (#121212).
 * Measured in-browser: comments 3.89:1, punctuation 3.26:1, and the translucent
 * string variant 2.36:1. `colorReplacements` lifts each one over 4.5:1 while
 * keeping its hue, so comments still read as recessive.
 *
 * Keys must be lowercase: Shiki looks them up with `color.toLowerCase()`, so
 * the theme's own uppercase hex values would never match.
 */
const accessibleVitesseDark = {
  ...vitesseDark,
  colorReplacements: {
    ...vitesseDark.colorReplacements,
    '#758575dd': '#7e8e7e', // comments       3.89 -> 5.90
    '#666666': '#8a8a8a', // punctuation    3.26 -> 5.42
    '#c98a7d77': '#b87f72', // string accents 2.36 -> 5.64
  },
}

const rehypePrettyCodeOptions = {
  theme: { light: 'vitesse-light', dark: accessibleVitesseDark },
  defaultColor: false as const,
  keepBackground: false,
  defaultLang: 'plaintext',
}

export function getFiles(type: string): string[] {
  const prefixPaths = path.join(root, 'data', type)
  const files = getAllFilesRecursively(prefixPaths)
  // Only want to return blog/path and ignore root, replace is needed to work on Windows
  return files.map((file: string) => file.slice(prefixPaths.length + 1).replace(/\\/g, '/'))
}

export function formatSlug(slug: string): string {
  return slug.replace(/\.(mdx|md)/, '')
}

export function dateSortDesc(a: string | null | undefined, b: string | null | undefined): number {
  const first = a || ''
  const second = b || ''
  if (first > second) return -1
  if (first < second) return 1
  return 0
}

export async function getFileBySlug(type: string, slug: string): Promise<MdxFile> {
  const [
    { bundleMDX },
    { default: remarkGfm },
    { default: remarkMath },
    { default: rehypeSlug },
    { default: rehypeAutolinkHeadings },
    { default: rehypeKatex },
    { default: rehypePrettyCode },
  ] = await Promise.all([
    import('mdx-bundler'),
    import('remark-gfm'),
    import('remark-math'),
    import('rehype-slug'),
    import('rehype-autolink-headings'),
    import('rehype-katex'),
    import('rehype-pretty-code'),
  ])

  const mdxPath = path.join(root, 'data', type, `${slug}.mdx`)
  const mdPath = path.join(root, 'data', type, `${slug}.md`)
  const source = fs.existsSync(mdxPath)
    ? fs.readFileSync(mdxPath, 'utf8')
    : fs.readFileSync(mdPath, 'utf8')

  // https://github.com/kentcdodds/mdx-bundler#nextjs-esbuild-enoent
  if (process.platform === 'win32') {
    process.env.ESBUILD_BINARY_PATH = path.join(root, 'node_modules', 'esbuild', 'esbuild.exe')
  } else {
    process.env.ESBUILD_BINARY_PATH = path.join(root, 'node_modules', 'esbuild', 'bin', 'esbuild')
  }

  let toc: TocHeading[] = []

  const mdxBundleOptions: any = {
    source,
    // mdx imports can be automatically source from the components directory
    cwd: path.join(root, 'components'),
    mdxOptions(options: any) {
      // this is the recommended way to add custom remark/rehype plugins:
      // The syntax might look weird, but it protects you in case we add/remove
      // plugins in the future.
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        remarkExtractFrontmatter,
        [remarkTocHeadings, { exportRef: toc }],
        remarkGfm,
        remarkMath,
        remarkImgToJsx,
      ]
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        rehypeAutolinkHeadings,
        rehypeKatex,
        [rehypePrettyCode, rehypePrettyCodeOptions],
      ]
      return options
    },
    esbuildOptions: (options: any) => {
      options.loader = {
        ...options.loader,
        '.js': 'jsx',
      }
      return options
    },
  }

  const { code, frontmatter } = await bundleMDX(mdxBundleOptions)

  // rehype-katex only emits `katex` class names when remark-math actually matched
  // math delimiters, so the compiled output is an exact signal for whether this post
  // needs the KaTeX stylesheet. Checking the source for `$` instead would false-positive
  // on every shell snippet.
  const hasMath = code.includes('katex')

  return {
    mdxSource: code,
    toc,
    frontMatter: {
      readingTime: readingTime(code),
      slug,
      fileName: fs.existsSync(mdxPath) ? `${slug}.mdx` : `${slug}.md`,
      ...(frontmatter as Record<string, any>),
      lang: normalizeLocale(frontmatter.lang),
      locale: normalizeLocale(frontmatter.lang),
      date: frontmatter.date ? new Date(frontmatter.date).toISOString() : null,
      video: buildVideoFrontMatter(frontmatter, slug),
      hasMath,
    } as ContentFrontMatter,
  }
}

export async function getAllFilesFrontMatter(
  folder: string,
  options: { locale?: string } = {}
): Promise<ContentFrontMatter[]> {
  const { locale } = options
  const targetLocale = locale ? normalizeLocale(locale) : null
  const prefixPaths = path.join(root, 'data', folder)

  const files = getAllFilesRecursively(prefixPaths)

  const allFrontMatter: ContentFrontMatter[] = []

  files.forEach((file: string) => {
    // Replace is needed to work on Windows
    const fileName = file.slice(prefixPaths.length + 1).replace(/\\/g, '/')
    // Remove Unexpected File
    if (path.extname(fileName) !== '.md' && path.extname(fileName) !== '.mdx') {
      return
    }
    const source = fs.readFileSync(file, 'utf8')
    const { data: frontmatter } = matter(source) as { data: Record<string, any> }
    const currentLocale = normalizeLocale(frontmatter.lang)
    if (frontmatter.draft !== true && (!targetLocale || currentLocale === targetLocale)) {
      allFrontMatter.push({
        ...frontmatter,
        slug: formatSlug(fileName),
        fileName,
        lang: currentLocale,
        locale: currentLocale,
        date: frontmatter.date ? new Date(frontmatter.date).toISOString() : null,
        video: buildVideoFrontMatter(frontmatter, formatSlug(fileName)),
      } as ContentFrontMatter)
    }
  })

  return allFrontMatter.sort((a, b) => dateSortDesc(a.date, b.date))
}
