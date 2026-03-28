import { NextRequest, NextResponse } from 'next/server'
import { getTeam } from '@/lib/teams'
import { fetchTeamNews } from '@/lib/news'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const team = getTeam(slug)

  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  const articles = await fetchTeamNews(team)
  return NextResponse.json({ team, articles })
}
