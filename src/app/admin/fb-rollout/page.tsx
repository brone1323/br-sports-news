'use client'

import { useEffect, useState, useCallback } from 'react'

type Task = { slug: string; category: 'conference' | 'pro' | 'ncaa'; done: boolean; pageId: string | null }
type UpcomingGroup = { date: string; slugs: string[]; category: string }
type RolloutData = {
  today: string
  todayTasks: Task[]
  upcoming: UpcomingGroup[]
  progress: { done: number; total: number; pct: number }
  overdue: string[]
}

const CATEGORY_LABEL: Record<string, string> = {
  conference: 'NCAA Conference',
  pro: 'Pro Team',
  ncaa: 'NCAA School',
}

const CATEGORY_COLOR: Record<string, string> = {
  conference: '#7c3aed',
  pro: '#1d4ed8',
  ncaa: '#065f46',
}

function SlugLabel({ slug }: { slug: string }) {
  const parts = slug.split('-')
  // Capitalize nicely
  const label = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
  return <span title={slug}>{label}</span>
}

function RegisterForm({ slug, onSuccess }: { slug: string; onSuccess: (pageId: string) => void }) {
  const [pageId, setPageId] = useState('')
  const [token, setToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [copyText, setCopyText] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!pageId.trim()) { setErr('Page ID is required'); return }
    setSaving(true)
    setErr('')
    setCopyText('')
    try {
      const res = await fetch('/api/facebook/rollout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, pageId: pageId.trim(), pageAccessToken: token.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        onSuccess(pageId.trim())
      } else if (data.readOnly) {
        // Vercel read-only — show copy-paste helper
        setCopyText(data.updatedJson)
        setErr('Running on Vercel (read-only). Copy the JSON below and commit it to src/data/facebook-pages.json.')
      } else {
        setErr(data.error ?? 'Unknown error')
      }
    } catch {
      setErr('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          value={pageId}
          onChange={(e) => setPageId(e.target.value)}
          placeholder="Page ID (e.g. 123456789)"
          style={{ flex: '1 1 160px', padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13 }}
        />
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Page Access Token (optional)"
          style={{ flex: '2 1 260px', padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13 }}
        />
        <button
          type="submit"
          disabled={saving}
          style={{ padding: '4px 14px', borderRadius: 4, background: '#1d4ed8', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {err && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{err}</p>}
      {copyText && (
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(copyText)}
            style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, border: '1px solid #d1d5db', cursor: 'pointer', marginBottom: 4 }}
          >
            Copy updated JSON
          </button>
          <textarea
            readOnly
            value={copyText}
            rows={6}
            style={{ width: '100%', fontSize: 11, fontFamily: 'monospace', border: '1px solid #d1d5db', borderRadius: 4, padding: 4 }}
          />
        </div>
      )}
    </form>
  )
}

export default function FbRolloutPage() {
  const [data, setData] = useState<RolloutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [localDone, setLocalDone] = useState<Map<string, string>>(new Map())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/facebook/rollout')
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function toggle(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug); else next.add(slug)
      return next
    })
  }

  function markDone(slug: string, pageId: string) {
    setLocalDone((prev) => new Map(prev).set(slug, pageId))
    setExpanded((prev) => { const next = new Set(prev); next.delete(slug); return next })
  }

  if (loading) return <div style={{ padding: 32 }}>Loading…</div>
  if (!data) return <div style={{ padding: 32, color: 'red' }}>Failed to load rollout data.</div>

  const overdueToShow = data.overdue.filter((s) => !localDone.has(s))

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 860, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Facebook Page Rollout</h1>
      <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
        Daily schedule for creating Bragging Rights Facebook pages. Create each page manually in Meta Business Suite, then enter the Page ID here.
      </p>

      {/* ── Progress bar ── */}
      <div style={{ background: '#f3f4f6', borderRadius: 8, padding: '16px 20px', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>Overall Progress</span>
          <span style={{ fontWeight: 700, color: '#1d4ed8' }}>
            {data.progress.done + localDone.size} / {data.progress.total} ({data.progress.pct}%)
          </span>
        </div>
        <div style={{ background: '#e5e7eb', borderRadius: 99, height: 10, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              borderRadius: 99,
              background: 'linear-gradient(90deg, #1d4ed8, #7c3aed)',
              width: `${data.progress.pct}%`,
              transition: 'width 0.4s',
            }}
          />
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
          Rollout runs April 2 – May 4, 2026. Pages created here are automatically picked up by the daily post cron.
        </p>
      </div>

      {/* ── Overdue ── */}
      {overdueToShow.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>
            ⚠ Overdue ({overdueToShow.length})
          </h2>
          <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 10 }}>
            These pages were scheduled before today but haven&apos;t been created yet.
          </p>
          {overdueToShow.map((slug) => (
            <div key={slug} style={{ marginBottom: 8 }}>
              <button
                onClick={() => toggle(slug)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#dc2626' }}
              >
                {expanded.has(slug) ? '▾' : '▸'} <SlugLabel slug={slug} />
                <code style={{ marginLeft: 8, fontSize: 11, color: '#9ca3af' }}>{slug}</code>
              </button>
              {expanded.has(slug) && (
                <RegisterForm slug={slug} onSuccess={(id) => markDone(slug, id)} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Today ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          Today — {data.today}
        </h2>
        {data.todayTasks.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No pages scheduled for today.</p>
        ) : (
          data.todayTasks.map((task) => {
            const done = task.done || localDone.has(task.slug)
            const pid = task.pageId ?? localDone.get(task.slug)
            return (
              <div
                key={task.slug}
                style={{
                  border: `1px solid ${done ? '#bbf7d0' : '#e5e7eb'}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 8,
                  background: done ? '#f0fdf4' : '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{done ? '✅' : '⬜'}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}><SlugLabel slug={task.slug} /></span>
                    <code style={{ marginLeft: 8, fontSize: 11, color: '#9ca3af' }}>{task.slug}</code>
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 99,
                        background: CATEGORY_COLOR[task.category] + '22',
                        color: CATEGORY_COLOR[task.category],
                      }}
                    >
                      {CATEGORY_LABEL[task.category]}
                    </span>
                  </div>
                  {!done && (
                    <button
                      onClick={() => toggle(task.slug)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 6,
                        border: '1px solid #d1d5db',
                        cursor: 'pointer',
                        fontSize: 13,
                        background: expanded.has(task.slug) ? '#f3f4f6' : '#fff',
                      }}
                    >
                      {expanded.has(task.slug) ? 'Cancel' : 'Enter Page ID'}
                    </button>
                  )}
                  {done && pid && (
                    <code style={{ fontSize: 12, color: '#16a34a' }}>{pid}</code>
                  )}
                </div>
                {expanded.has(task.slug) && !done && (
                  <div style={{ marginTop: 8, paddingLeft: 28 }}>
                    <RegisterForm slug={task.slug} onSuccess={(id) => markDone(task.slug, id)} />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── Instructions ── */}
      <details style={{ marginBottom: 28, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px' }}>
        <summary style={{ fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>How to create a Facebook page</summary>
        <ol style={{ fontSize: 13, lineHeight: 1.8, marginTop: 10, paddingLeft: 20 }}>
          <li>Go to <strong>facebook.com/pages/create</strong> (or Meta Business Suite)</li>
          <li>Name: <em>Team Name on Bragging Rights</em> (e.g. &quot;New York Mets on Bragging Rights&quot;)</li>
          <li>Category: <strong>Sports</strong> → <strong>Professional Sports Team</strong> (or News/Media)</li>
          <li>After creation, copy the Page ID from the page URL or About section</li>
          <li>Go to <strong>Meta for Developers → your app → Page Access Tokens</strong> to get the token</li>
          <li>Paste both into the form above</li>
        </ol>
        <p style={{ fontSize: 12, color: '#92400e', marginTop: 8 }}>
          Note: If running on Vercel, the JSON update can&apos;t be saved automatically. Copy the updated JSON shown and commit it to <code>src/data/facebook-pages.json</code>.
        </p>
      </details>

      {/* ── Upcoming 7 days ── */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Coming Up (next 7 days)</h2>
        {data.upcoming.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Schedule complete.</p>
        ) : (
          Object.entries(
            data.upcoming.reduce<Record<string, UpcomingGroup[]>>((acc, g) => {
              if (!acc[g.date]) acc[g.date] = []
              acc[g.date].push(g)
              return acc
            }, {})
          ).map(([date, groups]) => (
            <div key={date} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{date}</h3>
              {groups.map((g, i) => (
                <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                  {g.slugs.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 12,
                        padding: '2px 8px',
                        borderRadius: 99,
                        background: CATEGORY_COLOR[g.category] + '15',
                        color: CATEGORY_COLOR[g.category],
                        border: `1px solid ${CATEGORY_COLOR[g.category]}40`,
                      }}
                    >
                      <SlugLabel slug={s} />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
