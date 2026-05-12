import { getErrorMessage } from '@/lib/utils/error'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const apiKey = process.env.KLAVIYO_API_KEY
    const listId = process.env.KLAVIYO_LIST_ID
    const response = await fetch(
      `https://a.klaviyo.com/api/v2/list/${listId}/subscribe?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profiles: [{ email }],
        }),
      }
    )

    if (response.status >= 400) {
      return NextResponse.json(
        { error: 'There was an error subscribing to the list.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: '' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
