# Glossary

**Localized metadata**
The SEO metadata for one page in one locale: title, description, canonical URL, hreflang alternates, Open Graph and Twitter cards, and feed links. Produced only by `localizedMetadata()` in `lib/metadata.ts`.

**Page reference**
The facts a route hands to Localized metadata to identify a page: its `kind`, its `locale`, and kind-specific data such as a post and its translations, or a tag and the locales it exists in. Routes describe _which_ page; the module decides _what_ metadata it gets.
