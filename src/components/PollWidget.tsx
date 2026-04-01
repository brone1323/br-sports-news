'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Poll {
  id: string
  question: string
  options: string[]
  votes: number[]
}

interface PollWidgetProps {
  slug: string
  primaryColor: string
}

export default function PollWidget({ slug, primaryColor }: PollWidgetProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [voted, setVoted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/polls/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.polls?.[0]) setPoll(data.polls[0])
      })
      .finally(() => setLoading(false))
  }, [slug])

  async function vote(optionIndex: number) {
    if (!poll || voted) return
    const res = await fetch(`/api/polls/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId: poll.id, optionIndex }),
    })
    if (res.ok) {
      const data = await res.json()
      setPoll((prev) => (prev ? { ...prev, votes: data.votes } : prev))
      setVoted(true)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-400">Loading poll…</p>
      </div>
    )
  }

  if (!poll) return null

  const totalVotes = poll.votes.reduce((a, b) => a + b, 0)

  return (
    <div className="p-4">
      <p className="text-sm font-semibold text-gray-800 mb-3">{poll.question}</p>
      <div className="space-y-2">
        {poll.options.map((option, i) =>
          voted ? (
            <div key={option} className="w-full text-sm rounded border border-gray-200 overflow-hidden">
              <div className="relative px-3 py-2">
                <div
                  className="absolute inset-y-0 left-0"
                  style={{ width: `${totalVotes > 0 ? Math.round((poll.votes[i] / totalVotes) * 100) : 0}%`, backgroundColor: primaryColor, opacity: 0.2 }}
                />
                <span className="relative text-gray-700">{option}</span>
                <span className="relative float-right text-gray-500 text-xs">
                  {totalVotes > 0 ? Math.round((poll.votes[i] / totalVotes) * 100) : 0}%
                </span>
              </div>
            </div>
          ) : (
            <button
              key={option}
              onClick={() => vote(i)}
              className="w-full text-left px-3 py-2 text-sm rounded border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors text-gray-700"
            >
              {option}
            </button>
          )
        )}
      </div>
      {voted && (
        <p className="text-xs text-gray-400 mt-2">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </p>
      )}
      <Link
        href="https://bragging-rights.com/polls"
        className="block text-center mt-3 text-xs font-semibold hover:underline"
        style={{ color: primaryColor }}
      >
        See all polls →
      </Link>
    </div>
  )
}
