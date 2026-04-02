import { NextRequest, NextResponse } from 'next/server'
import { getAllTeams } from '@/lib/teams'
import { fetchTeamNews } from '@/lib/news'
import { generateWeeklyPoll } from '@/lib/pollGenerator'
import { postToFacebook } from '@/lib/facebook'
import pages from '@/data/facebook-pages.json'

function buildPollPostMessage(teamName: string, question: string, options: string[], teamSlug: string): string {
  const teamPageUrl = `https://br-sports-news.vercel.app/team/${teamSlug}`
  const optionLines = options.map((o, i) => `${i + 1}. ${o}`).join('\n')

  return [
    `${teamName} Fan Poll`,
    '',
    question,
    '',
    optionLines,
    '',
    `Vote now: ${teamPageUrl}`,
  ].join('\n')
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.POLLS_CRON_SECRET) {
    console.warn('POLLS_CRON_SECRET is not set — polls cron endpoint is unprotected')
  } else if (authHeader !== `Bearer ${process.env.POLLS_CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { protocol, host } = new URL(request.url)
  const baseUrl = `${protocol}//${host}`

  const teams = getAllTeams()
  const fbPageMap = new Map(pages.map(p => [p.slug, p]))

  let generated = 0
  let posted = 0
  let skipped = 0
  const errors: string[] = []

  // Process teams sequentially to avoid hammering Claude API
  for (const team of teams) {
    try {
      const articles = await fetchTeamNews(team)
      const poll = await generateWeeklyPoll(team.slug, team.name, articles)

      if (!poll) {
        skipped++
        continue
      }

      // Store the poll in the polls route's in-memory store via the API
      const storeRes = await fetch(`${baseUrl}/api/polls/${team.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'store-weekly', poll }),
      })

      if (!storeRes.ok) {
        errors.push(`${team.slug}: failed to store poll`)
        continue
      }

      generated++

      // Post to Facebook if the team has a configured page
      const fbEntry = fbPageMap.get(team.slug)
      if (fbEntry?.pageId && fbEntry?.pageAccessToken) {
        const message = buildPollPostMessage(team.name, poll.question, poll.options, team.slug)
        const result = await postToFacebook(fbEntry.pageId, fbEntry.pageAccessToken, message)
        if (result.success) {
          posted++
        } else {
          errors.push(`${team.slug} FB: ${JSON.stringify(result.error)}`)
        }
      }
    } catch (err) {
      errors.push(`${team.slug}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({ generated, posted, skipped, errors })
}
