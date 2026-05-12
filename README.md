# marcelocarmona.com

Personal website and blog, built with Next.js, Tailwind CSS, and MD/MDX content.

The site currently includes:

- English and Spanish routes
- Blog, guides, projects, tags, and about pages
- A Cal.com booking page at `/book`
- Vercel Analytics and Speed Insights in production

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- MDX via `mdx-bundler`
- Giscus comments
- Optional Sentry and newsletter integrations

## Requirements

- Node.js `24.x`
- npm

## Local development

Install dependencies:

```bash
npm install
```

Start the standard development server:

```bash
npm run dev
```

Build and serve production locally:

```bash
npm run build
npm run serve
```

The app runs at `http://localhost:3000`.

## Environment variables

Use `.env.example` as a starting point for `.env.local`.

Most variables are optional and only needed if you want to enable:

- Giscus, Utterances, or Disqus comments
- Sentry
- Newsletter provider API routes

If you are only editing content, layout, or styles, you can usually leave them unset.

## Where to edit

- `data/siteMetadata.js`: site metadata, social links, analytics, comments, newsletter settings
- `data/blog/`: blog posts in `.md` or `.mdx`
- `data/authors/default.md`: author profile
- `data/projectsData.js`: projects page data
- `data/headerNavLinks.js`: navigation links
- `data/ui/`: localized UI copy
- `app/`: routes, metadata, feeds, robots, sitemap
- `components/`: shared UI, embeds, analytics, and comments
- `layouts/`: post and list layouts
- `public/static/`: images and favicons
- `css/tailwind.css`: Tailwind theme tokens and global styling

## Writing posts

Posts live in `data/blog/` and can use `.md` or `.mdx`.

Typical frontmatter:

```md
---
title: 'My Post'
date: '2026-03-25'
tags: ['Next.js', 'MDX']
summary: 'Short description'
draft: false
lang: en
translationKey: my-post
layout: PostLayout
---
```

Notes:

- `lang` defaults to English. Use `lang: es` for Spanish posts.
- Use the same `translationKey` to pair English and Spanish versions of the same article.
- `summary`, `draft`, `layout`, `images`, `authors`, and `canonicalUrl` are optional.

To scaffold a new post:

```bash
node ./scripts/compose.js
```

## Deployment

This repository is set up for Vercel.

If you add new third-party scripts or providers, review `next.config.js` and update the Content Security Policy as needed.
