import { getErrorMessage } from '@/lib/utils/error'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const formId = process.env.CONVERTKIT_FORM_ID
    const apiKey = process.env.CONVERTKIT_API_KEY
    const apiUrl = process.env.CONVERTKIT_API_URL

    const response = await fetch(`${apiUrl}forms/${formId}/subscribe`, {
      body: JSON.stringify({ email, api_key: apiKey }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

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
