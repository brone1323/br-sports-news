import { NextRequest, NextResponse } from 'next/server'
import { getTeam } from '@/lib/teams'
import type { GeneratedPoll } from '@/lib/pollGenerator'

// In-memory vote store: pollId -> votes per option index
const voteStore = new Map<string, number[]>()

// In-memory store for weekly AI-generated polls: teamSlug -> GeneratedPoll
const weeklyPollStore = new Map<string, GeneratedPoll>()

/**
 * Generates a seeded bot vote distribution for a new poll.
 * One option gets a plurality (~40-60%), others share the remainder.
 * Total votes land in the 80-400 range to simulate organic fan engagement.
 */
function seedBotVotes(numOptions: number): number[] {
  const total = 80 + Math.floor(Math.random() * 321) // 80–400
  const votes = new Array(numOptions).fill(0)

  // Pick a random leading option and give it 40-60% of votes
  const leaderIdx = Math.floor(Math.random() * numOptions)
  const leaderShare = 0.4 + Math.random() * 0.2
  votes[leaderIdx] = Math.round(total * leaderShare)

  // Distribute remainder randomly among the other options
  const others = Array.from({ length: numOptions }, (_, i) => i).filter(i => i !== leaderIdx)
  let remaining = total - votes[leaderIdx]
  for (let j = 0; j < others.length; j++) {
    if (j === others.length - 1) {
      votes[others[j]] = remaining
    } else {
      const share = Math.floor(Math.random() * remaining * 0.6)
      votes[others[j]] = share
      remaining -= share
    }
  }

  return votes
}

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
    if (!voteStore.has(poll.id)) {
      voteStore.set(poll.id, seedBotVotes(poll.options.length))
    }
    const votes = voteStore.get(poll.id)!
    return { ...poll, votes }
  })

  // Prepend the weekly AI-generated poll if available
  const weekly = weeklyPollStore.get(slug)
  if (weekly) {
    if (!voteStore.has(weekly.id)) {
      voteStore.set(weekly.id, seedBotVotes(weekly.options.length))
    }
    const votes = voteStore.get(weekly.id)!
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
    voteStore.set(pollId, seedBotVotes(poll.options.length))
  }
  const votes = voteStore.get(pollId)!
  votes[optionIndex]++

  return NextResponse.json({ pollId, votes })
}
