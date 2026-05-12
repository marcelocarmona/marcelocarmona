import { generateLlmsFullTxt } from '@/lib/ai-discovery'

export const runtime = 'nodejs'

export async function GET() {
  const body = await generateLlmsFullTxt()

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
