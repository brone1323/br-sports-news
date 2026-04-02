import { getAllTeams } from './teams'

export interface HotTake {
  id: string
  title: string
  excerpt: string
  url: string
  sourceName: string
  pubDate: string
  sport: string | null    // 'NFL' | 'NBA' | 'MLB' | 'NHL' | null
  teamSlugs: string[]     // matched team slugs
  hotScore: number        // 0–100
  fetchedAt: string
}

interface HotTakesCache {
  takes: HotTake[]
  fetchedAt: string
}

// Module-level in-memory cache (consistent with existing poll storage pattern)
let cache: HotTakesCache | null = null

// RSS feed sources in priority order
const FEEDS: { url: string; name: string }[] = [
  // 1. FanSided
  { url: 'https://fansided.com/feed/', name: 'FanSided' },
  // 2. ClutchPoints
  { url: 'https://clutchpoints.com/feed/', name: 'ClutchPoints' },
  { url: 'https://clutchpoints.com/nfl/feed/', name: 'ClutchPoints' },
  { url: 'https://clutchpoints.com/nba/feed/', name: 'ClutchPoints' },
  { url: 'https://clutchpoints.com/mlb/feed/', name: 'ClutchPoints' },
  { url: 'https://clutchpoints.com/nhl/feed/', name: 'ClutchPoints' },
  // 3. Fox Sports
  { url: 'https://www.foxsports.com/rss/nfl', name: 'Fox Sports' },
  { url: 'https://www.foxsports.com/rss/nba', name: 'Fox Sports' },
  { url: 'https://www.foxsports.com/rss/mlb', name: 'Fox Sports' },
  { url: 'https://www.foxsports.com/rss/nhl', name: 'Fox Sports' },
  // 4. SB Nation
  { url: 'https://www.sbnation.com/rss/current', name: 'SB Nation' },
  { url: 'https://www.sbnation.com/nfl/rss/current', name: 'SB Nation' },
  { url: 'https://www.sbnation.com/nba/rss/current', name: 'SB Nation' },
  { url: 'https://www.sbnation.com/mlb/rss/current', name: 'SB Nation' },
  { url: 'https://www.sbnation.com/nhl/rss/current', name: 'SB Nation' },
  // 5. Bleacher Report
  { url: 'https://bleacherreport.com/articles/feed', name: 'Bleacher Report' },
  { url: 'https://bleacherreport.com/nfl/articles/feed', name: 'Bleacher Report' },
  { url: 'https://bleacherreport.com/nba/articles/feed', name: 'Bleacher Report' },
  { url: 'https://bleacherreport.com/mlb/articles/feed', name: 'Bleacher Report' },
  { url: 'https://bleacherreport.com/nhl/articles/feed', name: 'Bleacher Report' },
]

// Strong opinion indicators — each match adds 20 points
const STRONG_KEYWORDS = [
  'hot take',
  'unpopular opinion',
  'controversial',
  'overrated',
  'underrated',
  'should fire',
  'should be fired',
  'should trade',
  'bust',
  'busted',
  'flop',
  'overpaid',
  'overhyped',
  'disaster',
  'embarrassing',
  'worst signing',
  'worst trade',
  'bold prediction',
  'take',
]

// Moderate opinion indicators — each match adds 8 points
const MODERATE_KEYWORDS = [
  'should',
  'must',
  'need to',
  'needs to',
  'ranking',
  'ranked',
  'grades',
  'grade',
  'report card',
  'biggest',
  'worst',
  'best',
  'why',
  'reasons',
  'bold',
  'prediction',
  'predict',
  'could',
  'might',
  'opinion',
  'argument',
  'case for',
  'case against',
  'better than',
  'worse than',
  'analysis',
  'breaking down',
  'reaction',
  'fire',
]

// Keywords that confirm a sport when team names aren't conclusive
const SPORT_KEYWORDS: Record<string, string[]> = {
  NFL: ['nfl', 'quarterback', 'touchdown', 'super bowl', 'nfc', 'afc', 'wide receiver', 'running back', 'nfl draft'],
  NBA: ['nba', 'basketball', 'three-pointer', 'nba draft', 'eastern conference', 'western conference', 'free agency nba'],
  MLB: ['mlb', 'baseball', 'pitcher', 'batting average', 'home run', 'world series', 'spring training'],
  NHL: ['nhl', 'hockey', 'goalie', 'stanley cup', 'power play', 'hat trick', 'nhl draft'],
}

// ── XML helpers (same approach as src/lib/news.ts) ──────────────────────────

function getTagContent(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m = block.match(re)
  return m ? m[1].trim() : ''
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

// ── Scoring / detection ──────────────────────────────────────────────────────

function computeHotScore(title: string, excerpt: string): number {
  const text = `${title} ${excerpt}`.toLowerCase()
  let score = 0

  for (const kw of STRONG_KEYWORDS) {
    if (text.includes(kw)) score += 20
  }
  for (const kw of MODERATE_KEYWORDS) {
    // word-boundary match where possible
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`\\b${escaped}\\b`)
    if (re.test(text)) score += 8
  }

  return Math.min(score, 100)
}

// Lazy-initialised team index so getAllTeams() is only called once per process
let teamIndex: { name: string; shortName: string; city: string; slug: string; league: string }[] | null = null

function getTeamIndex() {
  if (!teamIndex) {
    teamIndex = getAllTeams().map(t => ({
      name: t.name.toLowerCase(),
      shortName: t.shortName.toLowerCase(),
      city: t.city.toLowerCase(),
      slug: t.slug,
      league: t.league,
    }))
  }
  return teamIndex
}

function detectTeams(title: string, excerpt: string): string[] {
  const text = `${title} ${excerpt}`.toLowerCase()
  const matched: string[] = []

  for (const t of getTeamIndex()) {
    if (
      text.includes(t.name) ||
      // shortName only when it's at least 5 chars to avoid noise (e.g. "Sox" is fine, "A's" less so)
      (t.shortName.length >= 5 && text.includes(t.shortName))
    ) {
      matched.push(t.slug)
    }
  }

  return [...new Set(matched)]
}

function detectSport(title: string, excerpt: string, teamSlugs: string[]): string | null {
  // Check matched teams first
  if (teamSlugs.length > 0) {
    const index = getTeamIndex()
    const team = index.find(t => teamSlugs.includes(t.slug))
    if (team) return team.league
  }

  const text = `${title} ${excerpt}`.toLowerCase()
  for (const [sport, keywords] of Object.entries(SPORT_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return sport
    }
  }

  return null
}

// Stable ID: hash-like from URL to avoid duplicates across runs
function makeId(url: string): string {
  let h = 0
  for (let i = 0; i < url.length; i++) {
    h = (Math.imul(31, h) + url.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(16)
}

// ── Feed fetching ────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 8_000
const MAX_ITEMS_PER_FEED = 25

async function fetchFeed(feedUrl: string, sourceName: string): Promise<HotTake[]> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    const res = await fetch(feedUrl, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BraggingRightsSportsBot/1.0; +https://bragging-rights.online)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    })
    clearTimeout(timer)

    if (!res.ok) return []

    const xml = await res.text()
    const takes: HotTake[] = []
    const itemRe = /<item>([\s\S]*?)<\/item>/g
    let m: RegExpExecArray | null
    let count = 0

    while ((m = itemRe.exec(xml)) !== null && count < MAX_ITEMS_PER_FEED) {
      const item = m[1]
      const title = decodeEntities(stripHtml(getTagContent(item, 'title')))
      const link = getTagContent(item, 'link') || getTagContent(item, 'guid')
      const pubDate = getTagContent(item, 'pubDate')
      const description = decodeEntities(stripHtml(getTagContent(item, 'description')))

      count++
      if (!title || !link) continue

      const excerpt = description.slice(0, 300)
      const hotScore = computeHotScore(title, excerpt)

      // Minimum threshold — must have at least one keyword hit
      if (hotScore < 8) continue

      const teamSlugs = detectTeams(title, excerpt)
      const sport = detectSport(title, excerpt, teamSlugs)

      takes.push({
        id: makeId(link),
        title,
        excerpt,
        url: link,
        sourceName,
        pubDate,
        sport,
        teamSlugs,
        hotScore,
        fetchedAt: new Date().toISOString(),
      })
    }

    return takes
  } catch {
    return []
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function fetchHotTakes(): Promise<HotTake[]> {
  const results = await Promise.allSettled(
    FEEDS.map(f => fetchFeed(f.url, f.name))
  )

  const all: HotTake[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value)
  }

  // Deduplicate by stable ID
  const seen = new Set<string>()
  const deduped = all.filter(t => {
    if (seen.has(t.id)) return false
    seen.add(t.id)
    return true
  })

  // Sort: highest hotScore first, then newest pubDate
  deduped.sort((a, b) => {
    if (b.hotScore !== a.hotScore) return b.hotScore - a.hotScore
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return deduped
}

export function getCachedHotTakes(): HotTakesCache | null {
  return cache
}

export function setCachedHotTakes(takes: HotTake[]): void {
  cache = { takes, fetchedAt: new Date().toISOString() }
}

export function isCacheFresh(): boolean {
  if (!cache) return false
  const ageMs = Date.now() - new Date(cache.fetchedAt).getTime()
  return ageMs < 23 * 60 * 60 * 1000 // treat as fresh for 23 h
}

export function getHotTakesForTeam(teamSlug: string): HotTake[] {
  return cache?.takes.filter(t => t.teamSlugs.includes(teamSlug)) ?? []
}

export function getHotTakesBySport(sport: string): HotTake[] {
  return cache?.takes.filter(t => t.sport === sport.toUpperCase()) ?? []
}
