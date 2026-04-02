import { NextRequest, NextResponse } from 'next/server'
import { getTeam } from '@/lib/teams'
import type { GeneratedPoll } from '@/lib/pollGenerator'

// In-memory vote store: pollId -> votes per option index
const voteStore = new Map<string, number[]>()

// In-memory store for weekly AI-generated polls: teamSlug -> GeneratedPoll
const weeklyPollStore = new Map<string, GeneratedPoll>()

function getStaticPollDefinitions(slug: string, teamName: string, shortName: string) {
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

  const staticDefs = getStaticPollDefinitions(slug, team.name, team.shortName)
  const polls = staticDefs.map((poll) => {
    const votes = voteStore.get(poll.id) ?? new Array(poll.options.length).fill(0)
    return { ...poll, votes }
  })

  // Prepend the weekly AI-generated poll if available
  const weekly = weeklyPollStore.get(slug)
  if (weekly) {
    const votes = voteStore.get(weekly.id) ?? new Array(weekly.options.length).fill(0)
    polls.unshift({ ...weekly, votes })
  }

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

  const { action } = body as { action?: unknown; pollId?: unknown; optionIndex?: unknown }

  // Store a weekly AI-generated poll
  if (action === 'store-weekly') {
    const { poll } = body as { poll?: unknown }
    if (
      typeof poll !== 'object' ||
      poll === null ||
      typeof (poll as Record<string, unknown>).id !== 'string' ||
      typeof (poll as Record<string, unknown>).question !== 'string' ||
      !Array.isArray((poll as Record<string, unknown>).options)
    ) {
      return NextResponse.json({ error: 'Invalid poll object' }, { status: 400 })
    }
    const p = poll as GeneratedPoll
    weeklyPollStore.set(slug, p)
    return NextResponse.json({ stored: true, pollId: p.id })
  }

  // Cast vote
  const { pollId, optionIndex } = body as { pollId?: unknown; optionIndex?: unknown }

  if (typeof pollId !== 'string' || typeof optionIndex !== 'number') {
    return NextResponse.json({ error: 'pollId (string) and optionIndex (number) are required' }, { status: 400 })
  }

  // Find the poll definition (weekly or static)
  const weekly = weeklyPollStore.get(slug)
  const staticDefs = getStaticPollDefinitions(slug, team.name, team.shortName)
  const allPolls = weekly ? [weekly, ...staticDefs] : staticDefs
  const poll = allPolls.find((p) => p.id === pollId)

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
