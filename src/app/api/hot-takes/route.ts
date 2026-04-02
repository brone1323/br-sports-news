import { NextRequest, NextResponse } from 'next/server'
import {
  getCachedHotTakes,
  getHotTakesForTeam,
  getHotTakesBySport,
} from '@/lib/hotTakes'

/**
 * GET /api/hot-takes
 *   ?team=patriots-slug   — hot takes for a specific team (e.g. nfl-new-england-patriots)
 *   ?sport=NFL            — hot takes for a sport (NFL | NBA | MLB | NHL)
 *   ?limit=20             — max results (default 20)
 *
 * Returns hot takes from the last daily cron run.
 * Returns an empty array with a 'stale' flag if the cron has not run yet today.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const team = searchParams.get('team')?.toLowerCase()
  const sport = searchParams.get('sport')?.toUpperCase()
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)

  const cached = getCachedHotTakes()

  if (!cached) {
    return NextResponse.json({
      takes: [],
      total: 0,
      stale: true,
      message: 'No hot takes cached yet — run /api/hot-takes/cron to populate.',
    })
  }

  let takes = cached.takes

  if (team) {
    takes = getHotTakesForTeam(team)
  } else if (sport) {
    takes = getHotTakesBySport(sport)
  }

  return NextResponse.json({
    takes: takes.slice(0, limit),
    total: takes.length,
    fetchedAt: cached.fetchedAt,
    stale: false,
  })
}
