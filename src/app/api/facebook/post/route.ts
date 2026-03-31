import { NextRequest, NextResponse } from 'next/server'
import { getTeam } from '@/lib/teams'
import { fetchTeamNews } from '@/lib/news'
import { buildPostMessage, postToFacebook } from '@/lib/facebook'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { slug, pageId, pageAccessToken } = body

  if (!slug || !pageId || !pageAccessToken) {
    return NextResponse.json(
      { error: 'Missing required fields: slug, pageId, pageAccessToken' },
      { status: 400 }
    )
  }

  const team = getTeam(slug)
  if (!team) {
    return NextResponse.json({ error: `Team not found: ${slug}` }, { status: 404 })
  }

  const articles = await fetchTeamNews(team)
  const message = buildPostMessage(team, articles)
  const result = await postToFacebook(pageId, pageAccessToken, message)

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 502 })
  }

  return NextResponse.json({ success: true, postId: result.postId })
}
