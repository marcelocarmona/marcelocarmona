import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import { getFiles } from './mdx'
import { normalizeLocale } from './locales'
import kebabCase from './utils/kebabCase'

const root = process.cwd()

export async function getAllTags(
  type: string,
  options: { locale?: string } = {}
): Promise<Record<string, number>> {
  const { locale } = options
  const targetLocale = locale ? normalizeLocale(locale) : null
  const files = await getFiles(type)

  const tagCount: Record<string, number> = {}
  // Iterate through each post, putting all found tags into `tags`
  files.forEach((file) => {
    const source = fs.readFileSync(path.join(root, 'data', type, file), 'utf8')
    const { data } = matter(source)
    const currentLocale = normalizeLocale(data.lang)
    if (data.tags && data.draft !== true && (!targetLocale || currentLocale === targetLocale)) {
      data.tags.forEach((tag: string) => {
        const formattedTag = kebabCase(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
      })
    }
  })

  return tagCount
}
