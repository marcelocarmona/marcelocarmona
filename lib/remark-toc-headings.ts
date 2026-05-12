import { visit } from 'unist-util-visit'
import { slug } from 'github-slugger'
import { toString } from 'mdast-util-to-string'
import type { TocHeading } from '@/types/content'

export default function remarkTocHeadings(options: { exportRef: TocHeading[] }) {
  return (tree: any) =>
    visit(tree, 'heading', (node: any) => {
      const textContent = toString(node)
      options.exportRef.push({
        value: textContent,
        url: '#' + slug(textContent),
        depth: node.depth,
      })
    })
}
