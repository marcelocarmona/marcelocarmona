import { generateAiIndex } from '@/lib/ai-discovery'

export const runtime = 'nodejs'

export async function GET() {
  const index = await generateAiIndex()

  return Response.json(index, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
