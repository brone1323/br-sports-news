import Anthropic from '@anthropic-ai/sdk'
import { Article } from './news'

const client = new Anthropic()
const MODEL = 'claude-haiku-4-5-20251001'

export interface GeneratedPoll {
  id: string
  question: string
  options: string[]
  generatedAt: string
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function generateWeeklyPoll(
  teamSlug: string,
  teamName: string,
  articles: Article[]
): Promise<GeneratedPoll | null> {
  const realArticles = articles.filter(a => a.url !== '#')
  if (realArticles.length === 0) return null

  const headlines = realArticles
    .slice(0, 5)
    .map(a => `- ${a.headline}`)
    .join('\n')

  const maxAttempts = 3
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) await sleep(2 ** (attempt - 1) * 1000)

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: `You are creating a fan engagement poll for ${teamName} fans.

Based on these current news headlines about ${teamName}:
${headlines}

Generate an engaging poll question that fans would passionately argue about — something specific to what's happening with ${teamName} right now. Think hot-take debates, bold predictions, or controversial decisions.

Return only a JSON object with:
- "question": the poll question (e.g., "Should Michigan fire their offensive coordinator?", "Is Alabama's season over after the LSU loss?")
- "options": array of 2-4 short, opinionated answer choices (max ~8 words each, no wishy-washy "it depends" options)

Return only the JSON, no other text.`,
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
        typeof (parsed as Record<string, unknown>).question !== 'string' ||
        !Array.isArray((parsed as Record<string, unknown>).options)
      ) {
        return null
      }

      const p = parsed as { question: string; options: unknown[] }
      const options = p.options.filter((o): o is string => typeof o === 'string').slice(0, 4)
      if (options.length < 2) return null

      return {
        id: `${teamSlug}-weekly`,
        question: p.question,
        options,
        generatedAt: new Date().toISOString(),
      }
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
