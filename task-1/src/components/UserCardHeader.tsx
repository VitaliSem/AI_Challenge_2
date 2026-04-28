import type { LeaderboardUser } from '../leaderboard'
import { getInitials } from '../utils'

interface UserCardHeaderProps {
  user: LeaderboardUser
  rank: number
}

/**
 * Displays the header section of a user card with rank, avatar, and user info
 */
export function UserCardHeader({ user, rank }: UserCardHeaderProps) {
  return (
    <div className="user-card__identity">
      <span className="user-rank">{rank}</span>
      <div className="user-avatar" aria-hidden="true">
        {getInitials(user.firstName, user.lastName)}
      </div>

      <div className="user-meta">
        <h2>{`${user.firstName} ${user.lastName}`}</h2>
        <p>{`${user.position} (${user.unit})`}</p>
      </div>
    </div>
  )
}
