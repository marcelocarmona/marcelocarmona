export default function SeoSchema({ data }: { data: Record<string, any> | null | undefined }) {
  if (!data) {
    return null
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
