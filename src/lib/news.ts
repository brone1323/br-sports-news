import { Team } from './teams'

export interface Article {
  id: string
  headline: string
  excerpt: string
  source: string
  date: string
  imageUrl: string
  url: string
}

const sources = ['ESPN', 'The Athletic', 'Sportsnet', 'TSN', 'NBC Sports', 'CBS Sports']

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function randomSource(): string {
  return sources[Math.floor(Math.random() * sources.length)]
}

export function fetchTeamNews(team: Team): Article[] {
  const name = team.name
  const short = team.shortName
  const league = team.league

  return [
    {
      id: `${team.slug}-1`,
      headline: `${name} Eye Playoff Push as Season Reaches Critical Stretch`,
      excerpt: `The ${short} are making their intentions clear with a series of strong performances that have caught the attention of ${league} analysts. Head coach spoke postgame about the team's renewed focus and the adjustments that have sparked their recent winning streak.`,
      source: randomSource(),
      date: daysAgo(0),
      imageUrl: `https://picsum.photos/seed/${team.slug}-1/800/450`,
      url: '#',
    },
    {
      id: `${team.slug}-2`,
      headline: `Injury Report: ${name} Roster Update Ahead of Key Matchup`,
      excerpt: `The ${short} announced several roster updates on Friday, with two key players listed as questionable for tomorrow's game. Team trainers remain cautiously optimistic about their availability after they took part in a limited practice session.`,
      source: randomSource(),
      date: daysAgo(1),
      imageUrl: `https://picsum.photos/seed/${team.slug}-2/800/450`,
      url: '#',
    },
    {
      id: `${team.slug}-3`,
      headline: `${name} Sign Veteran Forward in Bid to Bolster Depth`,
      excerpt: `In a move designed to provide additional experience down the lineup, the ${short} have signed a veteran free agent to a short-term deal. The addition gives the team flexibility heading into the busiest portion of their ${league} schedule.`,
      source: randomSource(),
      date: daysAgo(1),
      imageUrl: `https://picsum.photos/seed/${team.slug}-3/800/450`,
      url: '#',
    },
    {
      id: `${team.slug}-4`,
      headline: `Breaking Down the ${name}'s Offensive Surge`,
      excerpt: `Statistical analysis of the ${short}'s recent run reveals a team firing on all cylinders offensively, ranking among the top five in the ${league} in several key categories. Experts point to improved ball movement and execution in high-pressure situations as the primary drivers.`,
      source: randomSource(),
      date: daysAgo(2),
      imageUrl: `https://picsum.photos/seed/${team.slug}-4/800/450`,
      url: '#',
    },
    {
      id: `${team.slug}-5`,
      headline: `${name} Coach Addresses Trade Rumours at Midweek Presser`,
      excerpt: `Ahead of Thursday's home game, the ${short} head coach fielded multiple questions about circulating trade speculation, firmly stating the focus remains on winning games. The front office is expected to be active monitoring the market but has yet to pull the trigger on any moves.`,
      source: randomSource(),
      date: daysAgo(4),
      imageUrl: `https://picsum.photos/seed/${team.slug}-5/800/450`,
      url: '#',
    },
    {
      id: `${team.slug}-6`,
      headline: `Fan Favourite Returns to Practice, Boosts ${name} Morale`,
      excerpt: `A beloved ${short} veteran who has been sidelined since early in the season returned to full practice on Wednesday, sending a surge of optimism through the locker room. The club has been cautious with his recovery but the timeline is looking increasingly positive.`,
      source: randomSource(),
      date: daysAgo(6),
      imageUrl: `https://picsum.photos/seed/${team.slug}-6/800/450`,
      url: '#',
    },
  ]
}
