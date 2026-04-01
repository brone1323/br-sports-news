import { NextRequest, NextResponse } from 'next/server'
import { getTeam } from '@/lib/teams'
import { fetchTeamNews } from '@/lib/news'
import { rewriteArticle } from '@/lib/claude'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('team') ?? 'dallas-cowboys'

  const team = getTeam(slug)
  if (!team) {
    return NextResponse.json({ error: `Unknown team slug: ${slug}` }, { status: 400 })
  }

  console.log(`[test-rewrite] Fetching news for ${team.name}`)
  const articles = await fetchTeamNews(team)
  const original = articles[0]

  if (!original) {
    return NextResponse.json({ error: 'No articles found' }, { status: 404 })
  }

  console.log(`[test-rewrite] Rewriting article: "${original.headline}"`)
  const start = Date.now()
  const rewritten = await rewriteArticle(original)
  const durationMs = Date.now() - start

  if (!rewritten) {
    console.error('[test-rewrite] rewriteArticle() returned null')
    return NextResponse.json(
      {
        error: 'Rewrite failed — check ANTHROPIC_API_KEY and logs',
        original,
      },
      { status: 500 }
    )
  }

  console.log(`[test-rewrite] Done in ${durationMs}ms`)

  return NextResponse.json({
    team: team.name,
    durationMs,
    original: {
      headline: original.headline,
      excerpt: original.excerpt,
    },
    rewritten,
  })
}
