import { NextResponse } from 'next/server'

export async function POST(request) {
  const { email } = await request.json()
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const apiKey = process.env.MAILCHIMP_API_KEY
    const apiServer = process.env.MAILCHIMP_API_SERVER
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID

    if (!apiKey || !apiServer || !audienceId) {
      return NextResponse.json(
        { error: 'Mailchimp environment variables are not configured' },
        { status: 500 }
      )
    }

    const auth = Buffer.from(`anystring:${apiKey}`).toString('base64')
    const response = await fetch(
      `https://${apiServer}.api.mailchimp.com/3.0/lists/${audienceId}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
        }),
      }
    )

    if (response.status >= 400) {
      return NextResponse.json(
        { error: 'There was an error subscribing to the list.' },
        { status: response.status }
      )
    }

    return NextResponse.json({ error: '' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message || error.toString() }, { status: 500 })
  }
}
