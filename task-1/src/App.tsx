import { useMemo, useState } from 'react'
import { mockUsers, type ActivityCategory } from './data/mockUsers'
import './App.css'

type ActivitySummary = {
  education: number
  'public speaking': number
  'university partnership': number
}

type Quarter = 'all' | 'q1' | 'q2' | 'q3' | 'q4'

const QUARTER_MONTHS: Record<Exclude<Quarter, 'all'>, number[]> = {
  q1: [0, 1, 2],
  q2: [3, 4, 5],
  q3: [6, 7, 8],
  q4: [9, 10, 11],
}

const QUARTER_LABELS: Record<Quarter, string> = {
  all: 'All Quarters',
  q1: 'Q1',
  q2: 'Q2',
  q3: 'Q3',
  q4: 'Q4',
}

const CATEGORY_LABELS_FILTER: Record<ActivityCategory | 'all', string> = {
  all: 'All Categories',
  education: 'Education',
  'public speaking': 'Public Speaking',
  'university partnership': 'University Partnership',
}

const categoryLabels: Record<keyof ActivitySummary, string> = {
  education: 'Education',
  'public speaking': 'Public Speaking',
  'university partnership': 'University Partnership',
}

function parseActivityDate(date: string): Date {
  const [day, month, year] = date.split('-')
  return new Date(`${month} ${day}, ${year}`)
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

function getCategorySummary(
  activities: typeof mockUsers[number]['activities'],
): ActivitySummary {
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

const leaderboardUsers = mockUsers
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
      totalPoints: user.activities.reduce(
        (sum, activity) => sum + activity.recognitionPoints,
        0,
      ),
    }
  })
  .sort((left, right) => right.totalPoints - left.totalPoints)

const availableYears: number[] = [
  ...new Set(
    mockUsers.flatMap((u) =>
      u.activities.map((a) => parseActivityDate(a.date).getFullYear()),
    ),
  ),
].sort()

// ── Select + Search icons ────────────────────────────────────────────────────

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="select-chevron">
      <path d="m5 7 5 5 5-5" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="search-icon-svg">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4 4" />
    </svg>
  )
}

// ── FiltersBar ────────────────────────────────────────────────────────────────

interface FiltersBarProps {
  selectedYear: string
  selectedQuarter: Quarter
  selectedCategory: ActivityCategory | 'all'
  searchText: string
  onYearChange: (v: string) => void
  onQuarterChange: (v: Quarter) => void
  onCategoryChange: (v: ActivityCategory | 'all') => void
  onSearchChange: (v: string) => void
}

function FiltersBar({
  selectedYear,
  selectedQuarter,
  selectedCategory,
  searchText,
  onYearChange,
  onQuarterChange,
  onCategoryChange,
  onSearchChange,
}: FiltersBarProps) {
  return (
    <div className="filters-bar">
      <div className="filters-bar__row">
        <label className="filter-select-wrap">
          <span className="sr-only">Filter by year</span>
          <select
            className="filter-select"
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
          >
            <option value="all">All Years</option>
            {availableYears.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
          <ChevronDownIcon />
        </label>

        <label className="filter-select-wrap">
          <span className="sr-only">Filter by quarter</span>
          <select
            className="filter-select"
            value={selectedQuarter}
            onChange={(e) => onQuarterChange(e.target.value as Quarter)}
          >
            {(Object.keys(QUARTER_LABELS) as Quarter[]).map((q) => (
              <option key={q} value={q}>{QUARTER_LABELS[q]}</option>
            ))}
          </select>
          <ChevronDownIcon />
        </label>

        <label className="filter-select-wrap">
          <span className="sr-only">Filter by category</span>
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as ActivityCategory | 'all')}
          >
            {(Object.keys(CATEGORY_LABELS_FILTER) as (ActivityCategory | 'all')[]).map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS_FILTER[c]}</option>
            ))}
          </select>
          <ChevronDownIcon />
        </label>

        <label className="search-wrap">
          <span className="sr-only">Search employees</span>
          <SearchIcon />
          <input
            type="search"
            className="search-input"
            placeholder="Search employee..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
      </div>
    </div>
  )
}

function CategoryIcon({ category }: { category: keyof ActivitySummary }) {
  if (category === 'education') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6.5 12 3l8 3.5-8 3.5L4 6.5Z" />
        <path d="M7 9.2v4.1c0 1.2 2.2 2.7 5 2.7s5-1.5 5-2.7V9.2" />
      </svg>
    )
  }

  if (category === 'public speaking') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3Z" />
        <path d="M6 10.5a6 6 0 0 0 12 0" />
        <path d="M12 16.5V20" />
        <path d="M9 20h6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16v9H4z" />
      <path d="M8 6V4h8v2" />
      <path d="M12 15v5" />
      <path d="M9 20h6" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 2.8 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2L3 9.4l6.2-.9L12 2.8Z" />
    </svg>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={expanded ? 'rotated' : ''}>
      <path d="m6 14 6-6 6 6" />
    </svg>
  )
}

type LeaderboardUser = (typeof leaderboardUsers)[number]
type PodiumUser = LeaderboardUser & { rank: 1 | 2 | 3 }

const PODIUM_COLORS: Record<1 | 2 | 3, { ring: string; badge: string; podium: string; text: string }> = {
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
          style={{ '--ring-color': colors.ring } as React.CSSProperties}
        >
          <div className="podium-avatar">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <span
            className="podium-badge"
            style={{ background: colors.badge, color: colors.text }}
            aria-label={`Rank ${rank}`}
          >
            {rank}
          </span>
        </div>

        <p className="podium-name">{user.firstName} {user.lastName}</p>
        <p className="podium-position">{user.position} ({user.unit})</p>

        <div
          className="podium-points"
          style={{ borderColor: colors.ring, color: colors.text === '#fff' ? colors.badge : colors.text }}
        >
          <StarIcon />
          <strong>{user.totalPoints}</strong>
        </div>
      </div>

      <div
        className="podium-block"
        style={{ background: `linear-gradient(180deg, ${colors.podium}, color-mix(in srgb, ${colors.podium} 70%, #000))` }}
      >
        <span className="podium-block__label" style={{ color: colors.text === '#fff' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.15)' }}>
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
          style={{ '--ring-color': colors.ring } as React.CSSProperties}
        >
          <div className="podium-avatar podium-avatar--empty">—</div>
        </div>
      </div>
      <div
        className="podium-block"
        style={{ background: `linear-gradient(180deg, ${colors.podium}, color-mix(in srgb, ${colors.podium} 70%, #000))` }}
      >
        <span className="podium-block__label" style={{ color: colors.text === '#fff' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)' }}>
          {rank}
        </span>
      </div>
    </div>
  )
}

function NotFoundBlock() {
  return (
    <div className="not-found-block" role="status">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="not-found-block__icon">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4" />
        <circle cx="12" cy="16" r="0.5" fill="currentColor" />
      </svg>
      <span>No activities found matching the current filters.</span>
    </div>
  )
}

function TopThreePodium({ users }: { users: LeaderboardUser[] }) {
  const [first, second, third] = users.slice(0, 3)

  if (!first) return <NotFoundBlock />

  return (
    <section className="top-three" aria-label="Top 3 leaderboard">
      <div className="top-three__stage">
        {second ? <PodiumItem user={second as PodiumUser} rank={2} /> : <PodiumEmptySlot rank={2} />}
        <PodiumItem user={first as PodiumUser} rank={1} />
        {third ? <PodiumItem user={third as PodiumUser} rank={3} /> : <PodiumEmptySlot rank={3} />}
      </div>
    </section>
  )
}

function App() {
  const [expandedUsers, setExpandedUsers] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('all')
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all')
  const [searchText, setSearchText] = useState('')

  function toggleUser(userKey: string) {
    setExpandedUsers((current) =>
      current.includes(userKey)
        ? current.filter((item) => item !== userKey)
        : [...current, userKey],
    )
  }

  const filteredLeaderboardUsers = useMemo(() => {
    const hasDateFilter = selectedYear !== 'all' || selectedQuarter !== 'all'
    const hasCategoryFilter = selectedCategory !== 'all'
    const hasSearch = searchText.trim() !== ''

    return leaderboardUsers
      .map((user) => {
        let activities = user.sortedActivities

        // Date filter
        if (hasDateFilter) {
          activities = activities.filter((a) => {
            const d = parseActivityDate(a.date)
            const yearOk =
              selectedYear === 'all' || d.getFullYear() === parseInt(selectedYear)
            const quarterOk =
              selectedQuarter === 'all' ||
              QUARTER_MONTHS[selectedQuarter].includes(d.getMonth())
            return yearOk && quarterOk
          })
        }

        // Category filter
        if (hasCategoryFilter) {
          activities = activities.filter((a) => a.category === selectedCategory)
        }

        return {
          ...user,
          sortedActivities: activities,
          categorySummary: getCategorySummary(activities),
          totalPoints: activities.reduce((sum, a) => sum + a.recognitionPoints, 0),
        }
      })
      .filter((user) => {
        // Hide users with no matching activities when any activity filter is active
        if ((hasDateFilter || hasCategoryFilter) && user.sortedActivities.length === 0) {
          return false
        }
        // Search filter
        if (hasSearch) {
          const q = searchText.toLowerCase()
          return (
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(q) ||
            user.position.toLowerCase().includes(q) ||
            user.unit.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
  }, [selectedYear, selectedQuarter, selectedCategory, searchText])

  return (
    <main className="leaderboard-app">
      <header className="app-header">
        <h1 className="app-title">Leaderboard</h1>
        <p className="app-subtitle">Top performers based on contributions and activity</p>
      </header>

      <FiltersBar
        selectedYear={selectedYear}
        selectedQuarter={selectedQuarter}
        selectedCategory={selectedCategory}
        searchText={searchText}
        onYearChange={setSelectedYear}
        onQuarterChange={setSelectedQuarter}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearchText}
      />

      <TopThreePodium users={filteredLeaderboardUsers} />

      <ol className="leaderboard-list">
        {filteredLeaderboardUsers.map((user, index) => {
          const userKey = `${user.firstName}-${user.lastName}`
          const isExpanded = expandedUsers.includes(userKey)

          return (
            <li key={userKey} className="leaderboard-item">
              <article className={`user-card ${isExpanded ? 'is-expanded' : ''}`}>
                <div className="user-card__summary">
                  <div className="user-card__identity">
                    <span className="user-rank">{index + 1}</span>
                    <div className="user-avatar" aria-hidden="true">
                      {getInitials(user.firstName, user.lastName)}
                    </div>

                    <div className="user-meta">
                      <h2>{`${user.firstName} ${user.lastName}`}</h2>
                      <p>{`${user.position} (${user.unit})`}</p>
                    </div>
                  </div>

                  <div className="user-card__stats">
                    {Object.entries(user.categorySummary).filter(([, count]) => count > 0).map(([category, count]) => (
                      <div key={category} className="stat-chip" title={categoryLabels[category as keyof ActivitySummary]}>
                        <span className="stat-chip__icon">
                          <CategoryIcon category={category as keyof ActivitySummary} />
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
                      onClick={() => toggleUser(userKey)}
                      aria-expanded={isExpanded}
                      aria-controls={`activities-${userKey}`}
                    >
                      <span className="sr-only">
                        {isExpanded ? 'Collapse' : 'Expand'} recent activities for{' '}
                        {user.firstName} {user.lastName}
                      </span>
                      <ChevronIcon expanded={isExpanded} />
                    </button>
                  </div>
                </div>

                {isExpanded ? (
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
                                  {categoryLabels[activity.category]}
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
                ) : null}
              </article>
            </li>
          )
        })}
      </ol>
    </main>
  )
}

export default App
