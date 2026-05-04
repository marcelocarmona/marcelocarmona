import { escape } from '@/lib/utils/htmlEscaper'
import { getPostPath } from '@/lib/i18n/routes'

import siteMetadata from '@/data/siteMetadata'

function getValidDate(value) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getPostUpdatedDate(post) {
  return getValidDate(post.lastmod) || getValidDate(post.date)
}

function getPostPublishedDate(post) {
  return getValidDate(post.date)
}

function formatRssDate(value) {
  return getValidDate(value)?.toUTCString() || null
}

function formatAtomDate(value) {
  return getValidDate(value)?.toISOString() || null
}

function getSortedPosts(posts) {
  return [...posts].sort((a, b) => {
    const bTime = getPostPublishedDate(b)?.getTime() || 0
    const aTime = getPostPublishedDate(a)?.getTime() || 0
    return bTime - aTime
  })
}

function getLatestPostUpdatedDate(posts) {
  return posts.reduce((latestDate, post) => {
    const postUpdatedDate = getPostUpdatedDate(post)

    if (!postUpdatedDate) {
      return latestDate
    }

    if (!latestDate || postUpdatedDate.getTime() > latestDate.getTime()) {
      return postUpdatedDate
    }

    return latestDate
  }, null)
}

const generateRssItem = (post) => {
  const postUrl = `${siteMetadata.siteUrl}${getPostPath(post)}`
  const publishDate = formatAtomDate(post.date)
  const updatedDate = formatAtomDate(post.lastmod || post.date)
  const rssDate = formatRssDate(post.date)

  return `
  <item>
    <guid>${postUrl}</guid>
    <title>${escape(post.title)}</title>
    <link>${postUrl}</link>
    ${post.summary && `<description>${escape(post.summary)}</description>`}
    ${rssDate ? `<pubDate>${rssDate}</pubDate>` : ''}
    ${publishDate ? `<atom:published>${publishDate}</atom:published>` : ''}
    ${updatedDate ? `<atom:updated>${updatedDate}</atom:updated>` : ''}
    <author>${siteMetadata.email} (${siteMetadata.author})</author>
    ${post.tags && post.tags.map((tag) => `<category>${escape(tag)}</category>`).join('')}
  </item>
`
}

const generateRss = (posts, page = 'feed.xml', options = {}) => {
  const sortedPosts = getSortedPosts(posts)
  const { title, description, language, link } = options
  const feedTitle = title || siteMetadata.title
  const feedDescription = description || siteMetadata.description
  const feedLanguage = language || siteMetadata.language
  const feedLink = link || `${siteMetadata.siteUrl}/blog`
  const lastBuildDate = getLatestPostUpdatedDate(posts)?.toUTCString() || new Date().toUTCString()

  return `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(feedTitle)}</title>
      <link>${feedLink}</link>
      <description>${escape(feedDescription)}</description>
      <language>${feedLanguage}</language>
      <managingEditor>${siteMetadata.email} (${siteMetadata.author})</managingEditor>
      <webMaster>${siteMetadata.email} (${siteMetadata.author})</webMaster>
      <lastBuildDate>${lastBuildDate}</lastBuildDate>
      <atom:link href="${siteMetadata.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${sortedPosts.map(generateRssItem).join('')}
    </channel>
  </rss>
`
}
export default generateRss
