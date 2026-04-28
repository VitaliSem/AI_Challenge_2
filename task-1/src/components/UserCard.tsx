import type { LeaderboardUser } from '../leaderboard'
import { getUserKey } from '../utils'
import { UserCardHeader } from './UserCardHeader'
import { UserCardStats } from './UserCardStats'
import { UserCardActivities } from './UserCardActivities'

interface UserCardProps {
  user: LeaderboardUser
  rank: number
  isExpanded: boolean
  onToggle: () => void
}

/**
 * Main user card component that displays user info, stats, and activities
 * Composed of smaller sub-components for better maintainability
 */
export function UserCard({ user, rank, isExpanded, onToggle }: UserCardProps) {
  const userKey = getUserKey(user.firstName, user.lastName)

  return (
    <article className={`user-card ${isExpanded ? 'is-expanded' : ''}`}>
      <div className="user-card__summary">
        <UserCardHeader user={user} rank={rank} />
        <UserCardStats user={user} isExpanded={isExpanded} onToggle={onToggle} />
      </div>

      {isExpanded && <UserCardActivities user={user} userKey={userKey} />}
    </article>
  )
}
