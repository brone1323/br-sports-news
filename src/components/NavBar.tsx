import Link from 'next/link'
import { Team } from '@/lib/teams'

interface NavBarProps {
  team?: Team
}

export default function NavBar({ team }: NavBarProps) {
  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link
              href="https://bragging-rights.com"
              className="text-white font-bold text-lg tracking-tight hover:text-yellow-400 transition-colors"
            >
              <span className="text-yellow-400">BR</span> Sports News
            </Link>
            {team && (
              <>
                <span className="text-gray-600 hidden sm:block">|</span>
                <span
                  className="text-sm font-semibold hidden sm:block"
                  style={{ color: team.accentColor !== '#111111' ? team.accentColor : team.secondaryColor }}
                >
                  {team.league}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {team && (
              <span className="text-white font-semibold text-sm hidden md:block">
                {team.name}
              </span>
            )}
            <Link
              href="https://bragging-rights.com"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              bragging-rights.com
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
