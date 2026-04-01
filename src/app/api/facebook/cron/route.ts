import { NextRequest, NextResponse } from 'next/server'
import { getTeam } from '@/lib/teams'
import { fetchTeamNews } from '@/lib/news'
import { buildPostMessage, postToFacebook } from '@/lib/facebook'
import pages from '@/data/facebook-pages.json'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.FACEBOOK_CRON_SECRET) {
    console.warn('FACEBOOK_CRON_SECRET is not set — cron endpoint is unprotected')
  } else if (authHeader !== `Bearer ${process.env.FACEBOOK_CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { protocol, host } = new URL(request.url)
  const baseUrl = `${protocol}//${host}`

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
    if (articles.length === 0) {
      skipped++
      continue
    }

    const article = articles[0]
    const message = buildPostMessage(team, articles)

    const imageUrl =
      `${baseUrl}/api/facebook/article-image` +
      `?team=${encodeURIComponent(team.name)}` +
      `&headline=${encodeURIComponent(article.headline)}` +
      `&source=${encodeURIComponent(article.source)}`

    const result = await postToFacebook(entry.pageId, entry.pageAccessToken, message, imageUrl)
    if (result.success) {
      posted++
    } else {
      errors.push(`${entry.slug}: ${JSON.stringify(result.error)}`)
    }
  }

  return NextResponse.json({ posted, skipped, errors })
}
