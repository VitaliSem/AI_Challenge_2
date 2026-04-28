import { CATEGORY_LABELS, type ActivitySummary, type LeaderboardUser } from '../leaderboard'
import { CategoryIcon, ChevronIcon, StarIcon } from '../icons/Icons'

interface UserCardStatsProps {
  user: LeaderboardUser
  isExpanded: boolean
  onToggle: () => void
}

/**
 * Displays activity stats, total points, and expand button for a user card
 */
export function UserCardStats({ user, isExpanded, onToggle }: UserCardStatsProps) {
  const userKey = `${user.firstName}-${user.lastName}`

  return (
    <div className="user-card__stats">
      {Object.entries(user.categorySummary)
        .filter(([, count]) => count > 0)
        .map(([category, count]) => (
          <div key={category} className="stat-chip">
            <span
              className="stat-chip__icon"
              aria-label={CATEGORY_LABELS[category as keyof ActivitySummary]}
            >
              <CategoryIcon category={category as keyof ActivitySummary} />
              <span className="stat-chip__tooltip" role="tooltip">
                {CATEGORY_LABELS[category as keyof ActivitySummary]}
              </span>
            </span>
            <span className="stat-chip__count">{count}</span>
          </div>
        ))}

      <div className="total-points" aria-label={`Total recognition points: ${user.totalPoints}`}>
        <span className="total-points__label">Total</span>
        <div className="total-points__value">
          <StarIcon />
          <strong>{user.totalPoints}</strong>
        </div>
      </div>

      <button
        type="button"
        className="expand-button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`activities-${userKey}`}
      >
        <span className="sr-only">
          {isExpanded ? 'Collapse' : 'Expand'} recent activities for {user.firstName}{' '}
          {user.lastName}
        </span>
        <ChevronIcon expanded={isExpanded} />
      </button>
    </div>
  )
}
