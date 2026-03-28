import { Team } from './teams'

export interface Article {
  id: string
  headline: string
  excerpt: string
  source: string
  date: string
  imageUrl?: string
  url: string
}

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

function formatDate(pubDate: string): string {
  try {
    const d = new Date(pubDate)
    if (isNaN(d.getTime())) return pubDate
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return pubDate
  }
}

function parseRSSItems(xml: string, teamSlug: string): Article[] {
  const articles: Article[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null
  let i = 0

  while ((match = itemRegex.exec(xml)) !== null && i < 8) {
    const item = match[1]
    const title = decodeEntities(stripHtml(getTagContent(item, 'title')))
    const link = getTagContent(item, 'link') || getTagContent(item, 'guid')
    const pubDate = getTagContent(item, 'pubDate')
    const description = decodeEntities(stripHtml(getTagContent(item, 'description')))
    const source = decodeEntities(getTagContent(item, 'source')) || 'Google News'

    if (!title || !link) continue

    articles.push({
      id: `${teamSlug}-${i + 1}`,
      headline: title,
      excerpt: description.slice(0, 220),
      source,
      date: formatDate(pubDate),
      url: link,
    })
    i++
  }

  return articles
}

function fallbackArticle(team: Team): Article {
  return {
    id: `${team.slug}-no-news`,
    headline: `No Recent ${team.name} News`,
    excerpt: 'Check back soon for the latest headlines and updates.',
    source: 'BR Sports News',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    url: '#',
  }
}

export async function fetchTeamNews(team: Team): Promise<Article[]> {
  const searchTerm = team.searchTerms[0]
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchTerm)}&hl=en-CA&gl=CA&ceid=CA:en`

  try {
    const res = await fetch(rssUrl, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()
    const articles = parseRSSItems(xml, team.slug)
    return articles.length > 0 ? articles : [fallbackArticle(team)]
  } catch {
    return [fallbackArticle(team)]
  }
}
