import { NextRequest, NextResponse } from 'next/server'
import { fetchHotTakes, setCachedHotTakes } from '@/lib/hotTakes'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.FACEBOOK_CRON_SECRET) {
    console.warn('FACEBOOK_CRON_SECRET is not set — hot-takes cron endpoint is unprotected')
  } else if (authHeader !== `Bearer ${process.env.FACEBOOK_CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[hot-takes/cron] Starting daily hot takes fetch…')

  const takes = await fetchHotTakes()
  setCachedHotTakes(takes)

  const sportCounts: Record<string, number> = {}
  for (const t of takes) {
    const key = t.sport ?? 'unknown'
    sportCounts[key] = (sportCounts[key] ?? 0) + 1
  }

  console.log(`[hot-takes/cron] Fetched ${takes.length} hot takes:`, sportCounts)

  return NextResponse.json({
    total: takes.length,
    bySport: sportCounts,
    fetchedAt: new Date().toISOString(),
  })
}
