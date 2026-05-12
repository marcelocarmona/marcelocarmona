import { visit } from 'unist-util-visit'
import { load } from 'js-yaml'

export default function extractFrontmatter() {
  return (tree: any, file: any) => {
    visit(tree, 'yaml', (node: any) => {
      file.data.frontmatter = load(node.value)
    })
  }
}
