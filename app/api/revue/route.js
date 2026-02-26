import { NextResponse } from 'next/server'

export async function POST(request) {
  const { email } = await request.json()
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const apiKey = process.env.REVUE_API_KEY
    const revueRoute = `${process.env.REVUE_API_URL}subscribers`
    const response = await fetch(revueRoute, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, double_opt_in: false }),
    })

    if (response.status >= 400) {
      return NextResponse.json(
        { error: 'There was an error subscribing to the list.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ error: '' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message || error.toString() }, { status: 500 })
  }
}
