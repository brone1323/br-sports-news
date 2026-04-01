import Anthropic from '@anthropic-ai/sdk'
import { Article } from './news'

const client = new Anthropic()

const MODEL = 'claude-haiku-4-5-20251001'

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function rewriteArticle(
  article: Article
): Promise<{ headline: string; excerpt: string } | null> {
  const maxAttempts = 3

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await sleep(2 ** (attempt - 1) * 1000)
    }

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: `Rewrite this sports news headline and excerpt to be more engaging for a Facebook audience. Return only a JSON object with "headline" and "excerpt" fields, no other text.

Original headline: ${article.headline}
Original excerpt: ${article.excerpt}`,
          },
        ],
      })

      const textBlock = response.content.find(b => b.type === 'text')
      if (!textBlock || textBlock.type !== 'text') return null

      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return null

      const parsed = JSON.parse(jsonMatch[0]) as unknown
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        typeof (parsed as Record<string, unknown>).headline !== 'string' ||
        typeof (parsed as Record<string, unknown>).excerpt !== 'string'
      ) {
        return null
      }

      const result = parsed as { headline: string; excerpt: string }
      return { headline: result.headline, excerpt: result.excerpt }
    } catch (error) {
      if (
        error instanceof Anthropic.RateLimitError ||
        error instanceof Anthropic.InternalServerError ||
        error instanceof Anthropic.APIConnectionError
      ) {
        continue
      }
      return null
    }
  }

  return null
}
