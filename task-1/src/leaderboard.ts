import { mockUsers, type Activity, type ActivityCategory, type User } from './data/mockUsers'
import {
  parseActivityDate,
  getInitials,
  getCategorySummary,
  getTotalPoints,
} from './utils'

export type ActivitySummary = {
  education: number
  'public speaking': number
  'university partnership': number
}

export type Quarter = 'all' | 'q1' | 'q2' | 'q3' | 'q4'

export type LeaderboardUser = User & {
  sortedActivities: Activity[]
  categorySummary: ActivitySummary
  totalPoints: number
}

export const QUARTER_MONTHS: Record<Exclude<Quarter, 'all'>, number[]> = {
  q1: [0, 1, 2],
  q2: [3, 4, 5],
  q3: [6, 7, 8],
  q4: [9, 10, 11],
}

export const QUARTER_LABELS: Record<Quarter, string> = {
  all: 'All Quarters',
  q1: 'Q1',
  q2: 'Q2',
  q3: 'Q3',
  q4: 'Q4',
}

export const CATEGORY_LABELS_FILTER: Record<ActivityCategory | 'all', string> = {
  all: 'All Categories',
  education: 'Education',
  'public speaking': 'Public Speaking',
  'university partnership': 'University Partnership',
}

export const CATEGORY_LABELS: Record<keyof ActivitySummary, string> = {
  education: 'Education',
  'public speaking': 'Public Speaking',
  'university partnership': 'University Partnership',
}

// Re-export utilities used across components
export { parseActivityDate, getInitials, getCategorySummary, getTotalPoints }

export const leaderboardUsers: LeaderboardUser[] = mockUsers
  .map((user) => {
    const sortedActivities = [...user.activities].sort(
      (left, right) =>
        parseActivityDate(right.date).getTime() -
        parseActivityDate(left.date).getTime(),
    )

    return {
      ...user,
      sortedActivities,
      categorySummary: getCategorySummary(user.activities),
      totalPoints: getTotalPoints(user.activities),
    }
  })
  .sort((left, right) => right.totalPoints - left.totalPoints)

export const availableYears: number[] = [
  ...new Set(
    mockUsers.flatMap((user) =>
      user.activities.map((activity) => parseActivityDate(activity.date).getFullYear()),
    ),
  ),
].sort()
