import type { CSSProperties } from 'react'
import { getInitials, type LeaderboardUser } from '../leaderboard'
import { StarIcon } from '../icons/Icons'

type PodiumUser = LeaderboardUser & { rank: 1 | 2 | 3 }

const PODIUM_COLORS: Record<
  1 | 2 | 3,
  { ring: string; badge: string; podium: string; text: string }
> = {
  1: { ring: '#f5c243', badge: '#f5c243', podium: '#f5c243', text: '#7a5c00' },
  2: { ring: '#b0b8c1', badge: '#8c96a0', podium: '#c8d0d8', text: '#fff' },
  3: { ring: '#b5824a', badge: '#8c5e30', podium: '#c8a97a', text: '#fff' },
}

function PodiumItem({ user, rank }: { user: PodiumUser; rank: 1 | 2 | 3 }) {
  const colors = PODIUM_COLORS[rank]
  return (
    <div className={`podium-item podium-item--rank-${rank}`}>
      <div className="podium-user">
        <div
          className="podium-avatar-wrap"
          style={{ '--ring-color': colors.ring } as CSSProperties}
        >
          <div className="podium-avatar">{getInitials(user.firstName, user.lastName)}</div>
          <span
            className="podium-badge"
            style={{ background: colors.badge, color: colors.text }}
            aria-label={`Rank ${rank}`}
          >
            {rank}
          </span>
        </div>

        <p className="podium-name">
          {user.firstName} {user.lastName}
        </p>
        <p className="podium-position">
          {user.position} ({user.unit})
        </p>

        <div
          className="podium-points"
          style={{
            borderColor: colors.ring,
            color: colors.text === '#fff' ? colors.badge : colors.text,
          }}
        >
          <StarIcon />
          <strong>{user.totalPoints}</strong>
        </div>
      </div>

      <div
        className="podium-block"
        style={{
          background: `linear-gradient(180deg, ${colors.podium}, color-mix(in srgb, ${colors.podium} 70%, #000))`,
        }}
      >
        <span
          className="podium-block__label"
          style={{
            color:
              colors.text === '#fff'
                ? 'rgba(255,255,255,0.35)'
                : 'rgba(0,0,0,0.15)',
          }}
        >
          {rank}
        </span>
      </div>
    </div>
  )
}

function PodiumEmptySlot({ rank }: { rank: 1 | 2 | 3 }) {
  const colors = PODIUM_COLORS[rank]
  return (
    <div className={`podium-item podium-item--rank-${rank}`}>
      <div className="podium-user podium-user--empty">
        <div
          className="podium-avatar-wrap"
          style={{ '--ring-color': colors.ring } as CSSProperties}
        >
          <div className="podium-avatar podium-avatar--empty">-</div>
        </div>
      </div>
      <div
        className="podium-block"
        style={{
          background: `linear-gradient(180deg, ${colors.podium}, color-mix(in srgb, ${colors.podium} 70%, #000))`,
        }}
      >
        <span
          className="podium-block__label"
          style={{
            color:
              colors.text === '#fff'
                ? 'rgba(255,255,255,0.18)'
                : 'rgba(0,0,0,0.1)',
          }}
        >
          {rank}
        </span>
      </div>
    </div>
  )
}

interface PodiumProps {
  users: LeaderboardUser[]
}

export function Podium({ users }: PodiumProps) {
  const [first, second, third] = users.slice(0, 3)

  if (!first) {
    return null
  }

  return (
    <section className="top-three" aria-label="Top 3 leaderboard">
      <div className="top-three__stage">
        {second ? (
          <PodiumItem user={second as PodiumUser} rank={2} />
        ) : (
          <PodiumEmptySlot rank={2} />
        )}
        <PodiumItem user={first as PodiumUser} rank={1} />
        {third ? (
          <PodiumItem user={third as PodiumUser} rank={3} />
        ) : (
          <PodiumEmptySlot rank={3} />
        )}
      </div>
    </section>
  )
}
