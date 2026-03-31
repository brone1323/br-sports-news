import { Team } from './teams'
import { Article } from './news'

export function buildPostMessage(team: Team, articles: Article[]): string {
  const top = articles[0]
  const teamPageUrl = `https://br-sports-news.vercel.app/team/${team.slug}`

  return [
    `${team.name} Headlines`,
    '',
    top.headline,
    '',
    top.excerpt,
    '',
    `More ${team.name} news: ${teamPageUrl}`,
  ].join('\n')
}

export async function postToFacebook(
  pageId: string,
  accessToken: string,
  message: string
): Promise<{ success: boolean; postId?: string; error?: unknown }> {
  const res = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, access_token: accessToken }),
  })

  if (!res.ok) {
    const error = await res.json()
    return { success: false, error }
  }

  const data = await res.json()
  return { success: true, postId: data.id }
}
