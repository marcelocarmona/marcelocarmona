// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    const apiKey = process.env.MAILCHIMP_API_KEY
    const apiServer = process.env.MAILCHIMP_API_SERVER
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID

    if (!apiKey || !apiServer || !audienceId) {
      return res.status(500).json({ error: 'Mailchimp environment variables are not configured' })
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
      return res.status(response.status).json({
        error: 'There was an error subscribing to the list.',
      })
    }

    return res.status(201).json({ error: '' })
  } catch (error) {
    return res.status(500).json({ error: error.message || error.toString() })
  }
}
