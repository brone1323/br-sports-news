import { Article } from './news'

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const MAX_RETRIES = 5
const BASE_DELAY_MS = 1000

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Rewrites a single article's headline and excerpt via Gemini.
 * Returns null if rewriting fails (caller must not publish the article).
 */
export async function rewriteArticle(article: Article): Promise<Article | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set — cannot rewrite article')
    return null
  }

  const prompt = `Rewrite the following sports news headline and excerpt in an engaging, original style. Keep it factual and concise. Return ONLY a JSON object with keys "headline" and "excerpt" — no markdown, no extra text.

Headline: ${article.headline}
Excerpt: ${article.excerpt}`

  let lastError: unknown

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1)
      console.warn(`Gemini retry ${attempt}/${MAX_RETRIES - 1}, waiting ${delay}ms...`)
      await sleep(delay)
    }

    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
      })

      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After')
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : BASE_DELAY_MS * Math.pow(2, attempt)
        console.warn(`Gemini 429 rate limit on attempt ${attempt + 1}, waiting ${waitMs}ms`)
        lastError = new Error('Rate limited (429)')
        await sleep(waitMs)
        continue
      }

      if (!res.ok) {
        lastError = new Error(`Gemini HTTP ${res.status}: ${await res.text()}`)
        console.error(`Gemini error on attempt ${attempt + 1}:`, lastError)
        continue
      }

      const data = await res.json()
      const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

      // Strip markdown code fences if present
      const cleaned = rawText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
      let parsed: { headline?: string; excerpt?: string }
      try {
        parsed = JSON.parse(cleaned)
      } catch {
        lastError = new Error(`Failed to parse Gemini JSON: ${cleaned}`)
        console.error(lastError)
        continue
      }

      if (!parsed.headline || !parsed.excerpt) {
        lastError = new Error(`Gemini response missing fields: ${cleaned}`)
        console.error(lastError)
        continue
      }

      return { ...article, headline: parsed.headline, excerpt: parsed.excerpt }
    } catch (err) {
      lastError = err
      console.error(`Gemini attempt ${attempt + 1} threw:`, err)
    }
  }

  console.error(`Gemini rewrite failed after ${MAX_RETRIES} attempts:`, lastError)
  return null
}
