import Link from 'next/link'
import { Team } from '@/lib/teams'
import PollWidget from '@/components/PollWidget'

interface SidebarProps {
  team: Team
}

export default function Sidebar({ team }: SidebarProps) {
  const fbPageId = team.facebookPageId
  const fbUrl = fbPageId ? `https://facebook.com/${fbPageId}` : null

  return (
    <aside className="space-y-5">
      {/* Bragging Rights Links */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div
          className="px-4 py-3 text-white text-sm font-bold uppercase tracking-wide"
          style={{ backgroundColor: team.primaryColor }}
        >
          Bragging Rights
        </div>
        <nav className="divide-y divide-gray-50">
          {[
            { label: 'Home', href: 'https://bragging-rights.com' },
            { label: 'Polls', href: 'https://bragging-rights.com/polls' },
            { label: 'MLB Exchange', href: 'https://bragging-rights.com/mlb-exchange' },
            { label: 'All Teams', href: '/' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span>{label}</span>
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </nav>
      </div>

      {/* Today's Poll */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div
          className="px-4 py-3 text-white text-sm font-bold uppercase tracking-wide"
          style={{ backgroundColor: team.primaryColor }}
        >
          Today&apos;s Poll
        </div>
        <PollWidget slug={team.slug} primaryColor={team.primaryColor} />
      </div>

      {/* Team Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div
          className="px-4 py-3 text-white text-sm font-bold uppercase tracking-wide"
          style={{ backgroundColor: team.primaryColor }}
        >
          Team Stats
        </div>
        <div className="p-4 space-y-2">
          {[
            { label: 'Division', value: team.division },
            { label: 'League', value: team.league },
            { label: 'Record', value: '—' },
            { label: 'Standing', value: '—' },
            { label: 'Last 10', value: '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold text-gray-800">{value}</span>
            </div>
          ))}
          <p className="text-xs text-gray-400 pt-1">Live standings coming soon</p>
        </div>
      </div>

      {/* Follow on Facebook */}
      {fbUrl && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="px-4 py-3 text-white text-sm font-bold uppercase tracking-wide"
            style={{ backgroundColor: team.primaryColor }}
          >
            Follow the {team.shortName}
          </div>
          <div className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Get the latest {team.shortName} news on Facebook
            </p>
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 rounded text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1877F2' }}
            >
              Follow on Facebook
            </a>
          </div>
        </div>
      )}
    </aside>
  )
}
