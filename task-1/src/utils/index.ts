import type { ActivityCategory, Activity } from '../data/mockUsers'

/**
 * Generate a unique key for a user based on first and last name
 */
export function getUserKey(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
}

/**
 * Determine if a date filter is active
 */
export function isDateFilterActive(year: string, quarter: string): boolean {
  return year !== 'all' || quarter !== 'all'
}

/**
 * Determine if a category filter is active
 */
export function isCategoryFilterActive(category: ActivityCategory | 'all'): boolean {
  return category !== 'all'
}

/**
 * Determine if a search filter is active
 */
export function isSearchFilterActive(searchText: string): boolean {
  return searchText.trim() !== ''
}

/**
 * Check if user matches search text across name, position, and unit
 */
export function matchesSearch(
  searchText: string,
  firstName: string,
  lastName: string,
  position: string,
  unit: string,
): boolean {
  const q = searchText.toLowerCase()
  return (
    `${firstName} ${lastName}`.toLowerCase().includes(q) ||
    position.toLowerCase().includes(q) ||
    unit.toLowerCase().includes(q)
  )
}

/**
 * Format activity date string (DD-MM-YYYY) to Date object
 */
export function parseActivityDate(date: string): Date {
  const [day, month, year] = date.split('-')
  return new Date(`${month} ${day}, ${year}`)
}

/**
 * Get user initials from first and last name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

/**
 * Calculate activity summary (count by category)
 */
export interface ActivitySummary {
  education: number
  'public speaking': number
  'university partnership': number
}

export function getCategorySummary(activities: Activity[]): ActivitySummary {
  return activities.reduce<ActivitySummary>(
    (summary, activity) => {
      summary[activity.category] += 1
      return summary
    },
    {
      education: 0,
      'public speaking': 0,
      'university partnership': 0,
    },
  )
}

/**
 * Calculate total recognition points from activities
 */
export function getTotalPoints(activities: Activity[]): number {
  return activities.reduce((sum, activity) => sum + activity.recognitionPoints, 0)
}
