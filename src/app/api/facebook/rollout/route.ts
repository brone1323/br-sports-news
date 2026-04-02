import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import schedule from '@/data/fb-rollout-schedule.json'
import currentPages from '@/data/facebook-pages.json'

const PAGES_PATH = path.join(process.cwd(), 'src', 'data', 'facebook-pages.json')

type PageEntry = { slug: string; pageId: string; pageAccessToken: string }

/** Returns today's rollout tasks and overall progress. */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (process.env.FACEBOOK_CRON_SECRET && authHeader !== `Bearer ${process.env.FACEBOOK_CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)

  // Build a map of slug → pageId for quick lookup
  const configuredMap = new Map<string, string>()
  for (const p of currentPages as PageEntry[]) {
    if (p.pageId) configuredMap.set(p.slug, p.pageId)
  }

  // Find today's scheduled slugs across all categories
  const todayConf = schedule.ncaaConferences.schedule.find((d) => d.date === today)
  const todayPro = schedule.proTeams.schedule.find((d) => d.date === today)
  const todayNcaa = schedule.ncaaSchools.schedule.find((d) => d.date === today)

  const todayTasks = [
    ...(todayConf?.slugs ?? []).map((s) => ({ slug: s, category: 'conference' as const })),
    ...(todayPro?.slugs ?? []).map((s) => ({ slug: s, category: 'pro' as const })),
    ...(todayNcaa?.slugs ?? []).map((s) => ({ slug: s, category: 'ncaa' as const })),
  ].map((t) => ({ ...t, done: configuredMap.has(t.slug), pageId: configuredMap.get(t.slug) ?? null }))

  // Upcoming (next 7 days)
  const upcoming: { date: string; slugs: string[]; category: string }[] = []
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today + 'T12:00:00Z')
    d.setUTCDate(d.getUTCDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    const conf = schedule.ncaaConferences.schedule.find((x) => x.date === dateStr)
    const pro = schedule.proTeams.schedule.find((x) => x.date === dateStr)
    const ncaa = schedule.ncaaSchools.schedule.find((x) => x.date === dateStr)
    if (conf) upcoming.push({ date: dateStr, slugs: conf.slugs, category: 'conference' })
    if (pro) upcoming.push({ date: dateStr, slugs: pro.slugs, category: 'pro' })
    if (ncaa) upcoming.push({ date: dateStr, slugs: ncaa.slugs, category: 'ncaa' })
  }

  // Overall progress
  const allScheduled = [
    ...schedule.ncaaConferences.schedule.flatMap((d) => d.slugs),
    ...schedule.proTeams.schedule.flatMap((d) => d.slugs),
    ...schedule.ncaaSchools.schedule.flatMap((d) => d.slugs),
    ...schedule.alreadyConfigured,
  ]
  const totalScheduled = allScheduled.length
  const totalDone = allScheduled.filter((s) => configuredMap.has(s)).length

  // Overdue: scheduled before today, not yet done
  const overdue = [
    ...schedule.ncaaConferences.schedule.flatMap((d) => (d.date < today ? d.slugs : [])),
    ...schedule.proTeams.schedule.flatMap((d) => (d.date < today ? d.slugs : [])),
    ...schedule.ncaaSchools.schedule.flatMap((d) => (d.date < today ? d.slugs : [])),
  ].filter((s) => !configuredMap.has(s))

  return NextResponse.json({
    today,
    todayTasks,
    upcoming,
    progress: {
      done: totalDone,
      total: totalScheduled,
      pct: Math.round((totalDone / totalScheduled) * 100),
    },
    overdue,
  })
}

/**
 * Register a Facebook page ID and access token for a slug.
 * Body: { slug: string, pageId: string, pageAccessToken: string }
 *
 * On Vercel (read-only FS), returns a 503 with the updated JSON for manual copy.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (process.env.FACEBOOK_CRON_SECRET && authHeader !== `Bearer ${process.env.FACEBOOK_CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || !body.slug || !body.pageId) {
    return NextResponse.json({ error: 'slug and pageId are required' }, { status: 400 })
  }

  const { slug, pageId, pageAccessToken = '' } = body as {
    slug: string
    pageId: string
    pageAccessToken?: string
  }

  // Update the in-memory array
  const pages = [...(currentPages as PageEntry[])]
  const idx = pages.findIndex((p) => p.slug === slug)

  if (idx === -1) {
    // Slug not in facebook-pages.json yet — add it
    pages.push({ slug, pageId, pageAccessToken })
  } else {
    pages[idx] = { slug, pageId, pageAccessToken }
  }

  const updatedJson = JSON.stringify(pages, null, 2)

  try {
    await fs.writeFile(PAGES_PATH, updatedJson, 'utf8')
    return NextResponse.json({ success: true, slug, pageId })
  } catch {
    // Vercel serverless — FS is read-only. Return the updated JSON so Brian can paste it.
    return NextResponse.json(
      {
        success: false,
        readOnly: true,
        message: 'Filesystem is read-only (Vercel). Copy the updatedJson and commit it to the repo.',
        slug,
        pageId,
        updatedJson,
      },
      { status: 503 }
    )
  }
}
