import { NextRequest, NextResponse } from 'next/server'
import { getTeam } from '@/lib/teams'
import { fetchTeamNews } from '@/lib/news'
import { buildPostMessage, postToFacebook } from '@/lib/facebook'
import { rewriteArticle } from '@/lib/claude'
import pages from '@/data/facebook-pages.json'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (
    process.env.FACEBOOK_CRON_SECRET &&
    authHeader !== `Bearer ${process.env.FACEBOOK_CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let posted = 0
  let skipped = 0
  const errors: string[] = []

  for (const entry of pages) {
    if (!entry.pageId || !entry.pageAccessToken) {
      skipped++
      continue
    }

    const team = getTeam(entry.slug)
    if (!team) {
      errors.push(`Unknown slug: ${entry.slug}`)
      continue
    }

    const articles = await fetchTeamNews(team)
    const rewritten = await rewriteArticle(articles[0])
    const displayArticles = rewritten
      ? [{ ...articles[0], ...rewritten }, ...articles.slice(1)]
      : articles
    const message = buildPostMessage(team, displayArticles)

    const result = await postToFacebook(entry.pageId, entry.pageAccessToken, message, team.logoUrl)
    if (result.success) {
      posted++
    } else {
      errors.push(`${entry.slug}: ${JSON.stringify(result.error)}`)
    }
  }

  return NextResponse.json({ posted, skipped, errors })
}
