import { slug } from 'github-slugger'

const kebabCase = (str: string): string => slug(str)

export default kebabCase
