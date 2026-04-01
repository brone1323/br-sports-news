import { NextRequest, NextResponse } from 'next/server'
import { getTeam } from '@/lib/teams'
import { fetchTeamNews } from '@/lib/news'
import { rewriteArticle } from '@/lib/claude'

// POST /api/rewrite  body: { team: "dallas-cowboys" }
// GET  /api/rewrite?team=dallas-cowboys
export async function GET(request: NextRequest) {
  return handleRewrite(request)
}

export async function POST(request: NextRequest) {
  return handleRewrite(request)
}

async function handleRewrite(request: NextRequest) {
  let slug: string | null = null

  if (request.method === 'POST') {
    try {
      const body = (await request.json()) as { team?: unknown }
      if (typeof body.team === 'string') slug = body.team
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
  } else {
    slug = new URL(request.url).searchParams.get('team')
  }

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing required param: team (e.g. ?team=dallas-cowboys)' },
      { status: 400 }
    )
  }

  const team = getTeam(slug)
  if (!team) {
    return NextResponse.json({ error: `Unknown team slug: ${slug}` }, { status: 400 })
  }

  console.log(`[rewrite] Fetching latest article for ${team.name}`)
  const articles = await fetchTeamNews(team)
  const original = articles[0]

  if (!original) {
    return NextResponse.json({ error: 'No articles found for this team' }, { status: 404 })
  }

  console.log(`[rewrite] Rewriting: "${original.headline}"`)
  const rewritten = await rewriteArticle(original)

  if (!rewritten) {
    console.error(`[rewrite] rewriteArticle() failed for ${slug}`)
    return NextResponse.json(
      { error: 'Rewrite failed — check ANTHROPIC_API_KEY and server logs' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    team: team.name,
    slug: team.slug,
    article: {
      ...original,
      ...rewritten,
    },
  })
}
