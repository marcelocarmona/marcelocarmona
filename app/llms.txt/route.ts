import { generateLlmsTxt } from '@/lib/ai-discovery'

export const runtime = 'nodejs'

export async function GET() {
  const body = await generateLlmsTxt()

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
