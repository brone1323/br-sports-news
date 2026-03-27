import teamsData from '@/data/teams.json'

export interface Team {
  slug: string
  name: string
  shortName: string
  city: string
  league: string
  division: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logoUrl: string
  facebookPageId: string
  espnTeamId: string
  searchTerms: string[]
}

const teams: Team[] = teamsData as Team[]

export function getTeam(slug: string): Team | undefined {
  return teams.find((t) => t.slug === slug)
}

export function getAllTeams(): Team[] {
  return teams
}

export function getTeamsByLeague(league: string): Team[] {
  return teams.filter((t) => t.league.toLowerCase() === league.toLowerCase())
}

export function getAllLeagues(): string[] {
  return Array.from(new Set(teams.map((t) => t.league)))
}
