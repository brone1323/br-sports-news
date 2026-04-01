import { NextRequest, NextResponse } from 'next/server'
import { getTeam } from '@/lib/teams'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const team = getTeam(slug)

  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  const polls = [
    {
      id: `${slug}-playoffs`,
      question: `Will the ${team.shortName} make the playoffs this season?`,
      options: ['Yes, definitely', 'Probably', 'Unlikely', 'No chance'],
    },
    {
      id: `${slug}-championship`,
      question: `Do the ${team.name} have a shot at the championship?`,
      options: ['Absolutely', 'Maybe', 'Long shot', 'Not this year'],
    },
    {
      id: `${slug}-fan-confidence`,
      question: `How confident are you in the ${team.shortName} this season?`,
      options: ['Very confident', 'Somewhat confident', 'Not very confident', 'Not at all'],
    },
  ]

  return NextResponse.json({ polls })
}
