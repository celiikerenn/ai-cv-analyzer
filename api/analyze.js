const DEFAULT_MODEL = 'gemini-2.5-flash'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' })
  }

  const { prompt } = req.body
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    )

    if (!response.ok) {
      return res.status(response.status).json({ error: `Gemini API error (${response.status})` })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (e) {
    console.error('Serverless function error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
