import Image from 'next/image'
import { Team } from '@/lib/teams'

interface TeamHeaderProps {
  team: Team
}

export default function TeamHeader({ team }: TeamHeaderProps) {
  return (
    <div
      className="relative w-full py-12 px-6 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.primaryColor}cc 60%, ${team.secondaryColor}44 100%)`,
      }}
    >
      {/* Background texture overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto flex items-center gap-6">
        {/* Team logo */}
        {team.logoUrl ? (
          <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <Image
              src={team.logoUrl}
              alt={`${team.name} logo`}
              width={80}
              height={80}
              className="drop-shadow-lg"
            />
          </div>
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black flex-shrink-0 border-4"
            style={{
              backgroundColor: team.secondaryColor,
              borderColor: `${team.secondaryColor}66`,
              color: team.primaryColor,
            }}
          >
            {team.shortName.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div>
          <div className="flex items-center gap-3 mb-1">
            <span
              className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ backgroundColor: team.secondaryColor, color: team.primaryColor }}
            >
              {team.league}
            </span>
            <span className="text-white/60 text-xs">
              {team.division}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow">
            {team.name}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {team.city} · Latest News &amp; Updates
          </p>
        </div>
      </div>
    </div>
  )
}
