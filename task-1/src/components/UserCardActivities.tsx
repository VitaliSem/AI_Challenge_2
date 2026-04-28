import { CATEGORY_LABELS, type ActivitySummary, type LeaderboardUser } from '../leaderboard'

interface UserCardActivitiesProps {
  user: LeaderboardUser
  userKey: string
}

/**
 * Displays the expanded activities table for a user card
 */
export function UserCardActivities({ user, userKey }: UserCardActivitiesProps) {
  return (
    <div className="user-card__details" id={`activities-${userKey}`}>
      <p className="section-title">Recent activities</p>

      <div className="activity-table-wrapper">
        <table className="activity-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Category</th>
              <th>Date</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {user.sortedActivities.map((activity, activityIndex) => (
              <tr key={`${activity.name}-${activity.date}-${activityIndex}`}>
                <td>{activity.name}</td>
                <td>
                  <span className="category-pill">
                    {CATEGORY_LABELS[activity.category as keyof ActivitySummary]}
                  </span>
                </td>
                <td>{activity.date}</td>
                <td className="points-cell">+{activity.recognitionPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
