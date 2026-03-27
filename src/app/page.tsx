import Link from 'next/link'
import { getAllTeams, getTeamsByLeague } from '@/lib/teams'

const LEAGUES = ['NHL', 'NFL', 'NBA', 'MLB']

const LEAGUE_COLORS: Record<string, string> = {
  NHL: '#000000',
  NFL: '#013369',
  NBA: '#C9082A',
  MLB: '#002D72',
}

export default function HomePage() {
  const allTeams = getAllTeams()

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-950 border-b border-gray-800 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">
                <span className="text-yellow-400">BR</span> Sports News
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Team news sites for all {allTeams.length} major league franchises
              </p>
            </div>
            <Link
              href="https://bragging-rights.com"
              className="text-yellow-400 text-sm font-semibold hover:underline"
            >
              bragging-rights.com →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {LEAGUES.map((league) => {
          const teams = getTeamsByLeague(league)
          const leagueColor = LEAGUE_COLORS[league]

          return (
            <section key={league} className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-sm"
                  style={{ backgroundColor: leagueColor }}
                >
                  {league}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{league}</h2>
                  <p className="text-gray-500 text-xs">{teams.length} teams</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {teams.map((team) => {
                  const localUrl = `/team/${team.slug}`

                  return (
                    <Link
                      key={team.slug}
                      href={localUrl}
                      className="group relative rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      style={{ backgroundColor: `${team.primaryColor}22` }}
                      title={`${team.slug}.bragging-rights.com`}
                    >
                      <div
                        className="h-1.5 w-full"
                        style={{ backgroundColor: team.primaryColor }}
                      />
                      <div className="p-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mb-2"
                          style={{
                            backgroundColor: team.primaryColor,
                            color: team.secondaryColor,
                          }}
                        >
                          {team.shortName.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="text-white text-xs font-semibold leading-tight line-clamp-2">
                          {team.name}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">{team.city}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </main>

      <footer className="border-t border-gray-800 py-6 px-6 text-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} BR Sports News ·{' '}
          <Link href="https://bragging-rights.com" className="text-gray-400 hover:text-white transition-colors">
            bragging-rights.com
          </Link>
        </p>
      </footer>
    </div>
  )
}
