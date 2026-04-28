import { useState } from 'react'
import type { LeaderboardUser } from '../leaderboard'
import { getUserKey } from '../utils'
import { UserCard } from './UserCard'

interface ListOfUsersProps {
  users: LeaderboardUser[]
}

/**
 * Renders a list of users with controlled expansion state
 * Only one user card can be expanded at a time
 */
export function ListOfUsers({ users }: ListOfUsersProps) {
  const [expandedUserKey, setExpandedUserKey] = useState<string | null>(null)

  return (
    <ol className="leaderboard-list">
      {users.map((user, index) => {
        const userKey = getUserKey(user.firstName, user.lastName)
        const isExpanded = expandedUserKey === userKey

        return (
          <li key={userKey} className="leaderboard-item">
            <UserCard
              user={user}
              rank={index + 1}
              isExpanded={isExpanded}
              onToggle={() =>
                setExpandedUserKey((current) =>
                  current === userKey ? null : userKey,
                )
              }
            />
          </li>
        )
      })}
    </ol>
  )
}
