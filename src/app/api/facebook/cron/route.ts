import { NextRequest, NextResponse } from 'next/server'
import { getTeam, getTeamsByLeague } from '@/lib/teams'
import { fetchAndRewriteTeamNews } from '@/lib/claude'
import { buildPostMessage, buildConferencePostMessage, postToFacebook } from '@/lib/facebook'
import { getConference } from '@/lib/conferences'
import { fetchTeamNews, Article } from '@/lib/news'
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

    // Conference-level pages aggregate top news from across the conference
    if (entry.slug.startsWith('conference-')) {
      const conference = getConference(entry.slug)
      if (!conference) {
        errors.push(`Unknown conference slug: ${entry.slug}`)
        continue
      }

      const conferenceTeams = getTeamsByLeague(conference.leagueName)
      let conferenceArticles: Article[] = []
      for (const t of conferenceTeams.slice(0, 5)) {
        const raw = await fetchTeamNews(t)
        const real = raw.filter(a => a.url !== '#')
        if (real.length > 0) {
          conferenceArticles = real
          break
        }
      }

      if (conferenceArticles.length === 0) {
        skipped++
        continue
      }

      const article = conferenceArticles[0]
      const message = buildConferencePostMessage(conference, conferenceArticles)
      const imageUrl =
        `${baseUrl}/api/facebook/article-image` +
        `?team=${encodeURIComponent(conference.shortName)}` +
        `&headline=${encodeURIComponent(article.headline)}` +
        `&source=${encodeURIComponent(article.source)}`

      const result = await postToFacebook(entry.pageId, entry.pageAccessToken, message, imageUrl)
      if (result.success) {
        posted++
      } else {
        errors.push(`${entry.slug}: ${JSON.stringify(result.error)}`)
      }
      continue
    }

    const team = getTeam(entry.slug)
    if (!team) {
      errors.push(`Unknown slug: ${entry.slug}`)
      continue
    }

    const articles = await fetchAndRewriteTeamNews(team)
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
