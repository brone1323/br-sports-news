export interface Conference {
  slug: string
  name: string
  shortName: string
  leagueName: string
  primaryColor: string
  secondaryColor: string
}

export const CONFERENCES: Conference[] = [
  {
    slug: 'conference-big-ten',
    name: 'Big Ten Conference',
    shortName: 'Big Ten',
    leagueName: 'Big Ten',
    primaryColor: '#002D6C',
    secondaryColor: '#D4AF37',
  },
  {
    slug: 'conference-sec',
    name: 'Southeastern Conference',
    shortName: 'SEC',
    leagueName: 'SEC',
    primaryColor: '#003087',
    secondaryColor: '#FFFFFF',
  },
  {
    slug: 'conference-big-12',
    name: 'Big 12 Conference',
    shortName: 'Big 12',
    leagueName: 'Big 12',
    primaryColor: '#C8102E',
    secondaryColor: '#003087',
  },
  {
    slug: 'conference-acc',
    name: 'Atlantic Coast Conference',
    shortName: 'ACC',
    leagueName: 'ACC',
    primaryColor: '#013CA6',
    secondaryColor: '#FFFFFF',
  },
]

export function getConference(slug: string): Conference | undefined {
  return CONFERENCES.find(c => c.slug === slug)
}
