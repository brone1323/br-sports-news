import { notFound } from 'next/navigation'
import { getTeam, getAllTeams } from '@/lib/teams'
import { fetchAndRewriteTeamNews } from '@/lib/claude'
import NavBar from '@/components/NavBar'
import TeamHeader from '@/components/TeamHeader'
import NewsFeed from '@/components/NewsFeed'
import Sidebar from '@/components/Sidebar'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const teams = getAllTeams()
  return teams.map((team) => ({ slug: team.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const team = getTeam(slug)
  if (!team) return { title: 'Team Not Found' }
  return {
    title: `${team.name} News | BR Sports News`,
    description: `Latest ${team.name} news, scores, and updates on BR Sports News.`,
  }
}

export default async function TeamPage({ params }: PageProps) {
  const { slug } = await params
  const team = getTeam(slug)

  if (!team) {
    notFound()
  }

  const articles = await fetchAndRewriteTeamNews(team)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar team={team} />
      <TeamHeader team={team} />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Latest News</h2>
              <span className="text-sm text-gray-500">{articles.length} articles</span>
            </div>
            <NewsFeed articles={articles} accentColor={team.primaryColor} />
          </main>

          {/* Sidebar */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <Sidebar team={team} />
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 bg-white py-4 px-6 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} BR Sports News ·{' '}
            <a href="https://bragging-rights.com" className="hover:text-gray-700 transition-colors">
              bragging-rights.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
