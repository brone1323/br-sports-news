import { NextRequest, NextResponse } from 'next/server'
import { getTeam } from '@/lib/teams'

// In-memory vote store: pollId -> votes per option index
const voteStore = new Map<string, number[]>()

function getPollDefinitions(slug: string, teamName: string, shortName: string) {
  return [
    {
      id: `${slug}-playoffs`,
      question: `Will the ${shortName} make the playoffs this season?`,
      options: ['Yes, definitely', 'Probably', 'Unlikely', 'No chance'],
    },
    {
      id: `${slug}-championship`,
      question: `Do the ${teamName} have a shot at the championship?`,
      options: ['Absolutely', 'Maybe', 'Long shot', 'Not this year'],
    },
    {
      id: `${slug}-fan-confidence`,
      question: `How confident are you in the ${shortName} this season?`,
      options: ['Very confident', 'Somewhat confident', 'Not very confident', 'Not at all'],
    },
  ]
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const team = getTeam(slug)

  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  const defs = getPollDefinitions(slug, team.name, team.shortName)
  const polls = defs.map((poll) => {
    const votes = voteStore.get(poll.id) ?? new Array(poll.options.length).fill(0)
    return { ...poll, votes }
  })

  return NextResponse.json({ polls })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const team = getTeam(slug)

  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { pollId, optionIndex } = body as { pollId?: unknown; optionIndex?: unknown }

  if (typeof pollId !== 'string' || typeof optionIndex !== 'number') {
    return NextResponse.json({ error: 'pollId (string) and optionIndex (number) are required' }, { status: 400 })
  }

  const defs = getPollDefinitions(slug, team.name, team.shortName)
  const poll = defs.find((p) => p.id === pollId)

  if (!poll) {
    return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
  }

  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return NextResponse.json({ error: 'Invalid option index' }, { status: 400 })
  }

  if (!voteStore.has(pollId)) {
    voteStore.set(pollId, new Array(poll.options.length).fill(0))
  }
  const votes = voteStore.get(pollId)!
  votes[optionIndex]++

  return NextResponse.json({ pollId, votes })
}
