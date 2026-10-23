import siteMetadata from '@/data/siteMetadata'

const enUi = {
  meta: {
    home: {
      title: 'Software Engineer | Frontend, Cloud, AI | Marcelo Carmona',
      description: siteMetadata.description,
    },
    blog: {
      title: 'Blog',
      description: siteMetadata.description,
    },
    blogPage: (pageNumber: number) => ({
      title: `Blog Page ${pageNumber}`,
      description: siteMetadata.description,
    }),
    tags: {
      title: 'Tags',
      description:
        'Browse articles by topic: React, Next.js, TypeScript, AWS, Kubernetes, distributed systems, and more.',
    },
    tag: (tag: string, postCount: number) => ({
      title: tag,
      description: `Browse ${postCount} ${postCount === 1 ? 'post' : 'posts'} tagged ${tag} by ${siteMetadata.author}.`,
    }),
    about: {
      title: 'About',
      description: `${siteMetadata.author} is a software engineer focused on frontend architecture, React, Next.js, and performance-minded product delivery.`,
    },
    book: {
      title: 'Book a Call',
      description: `Book a call with ${siteMetadata.author}. Pick a time that works for you and the meeting is confirmed automatically.`,
    },
    guides: {
      title: 'Guides',
      description: 'Topic hubs for React, frontend architecture, and platform engineering.',
    },
  },
  footer: {
    bookCall: 'Book a call',
    contact: 'Contact',
    eyebrow: 'Software engineering',
    privacy: 'Privacy',
    summary:
      'Notes and practical work across frontend architecture, cloud infrastructure, delivery workflows, and the engineering decisions behind maintainable software.',
    title: 'Web products that hold up in production.',
    trustLinksLabel: 'Trust and contact pages',
  },
  list: {
    noPostsFound: 'No posts found.',
    paginationStatus: (currentPage: number, totalPages: number) =>
      `${currentPage} of ${totalPages}`,
    previousPage: 'Previous',
    publishedOn: 'Published on',
    searchArticles: 'Search articles',
    nextPage: 'Next',
    updatedOn: 'Updated',
  },
  navigation: {
    about: 'About',
    blog: 'Blog',
    book: 'Book',
    guides: 'Guides',
    tags: 'Tags',
  },
  post: {
    authors: 'Authors',
    backToBlog: 'Back to the blog',
    blogLabel: 'Blog',
    contents: 'Contents',
    homeLabel: 'Home',
    name: 'Name',
    nextArticle: 'Next Article',
    previousArticle: 'Previous Article',
    publishedOn: 'Published on',
    relatedArticles: 'Related Articles',
    tags: 'Tags',
    twitter: 'Twitter',
    translations: 'Also available in',
    updatedOn: 'Updated',
    viewOnGitHub: 'View on GitHub',
  },
  video: {
    articleEyebrow: 'Video overview',
    articleHelper: 'A concise video version of this article.',
    articleLabel: 'Article',
    backToArticle: 'Back to article',
    homeLabel: 'Home',
    readArticle: 'Read the full article',
    translations: 'Also available in',
    watchOnYouTube: 'Watch on YouTube',
    watchPageCta: 'Watch the video',
    watchPageLabel: 'Video',
  },
  scroll: {
    toComment: 'Scroll To Comment',
    toTop: 'Scroll To Top',
    viewAsMarkdown: 'View this article as Markdown for AI agents',
  },
}

export default enUi
