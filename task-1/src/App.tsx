import { useMemo, useState } from 'react'
import { FilterBar } from './components/FilterBar'
import { ListOfUsers } from './components/ListOfUsers'
import { NotFound } from './components/NotFound'
import { Podium } from './components/Podium'
import type { ActivityCategory } from './data/mockUsers'
import {
  getCategorySummary,
  leaderboardUsers,
  QUARTER_MONTHS,
  type Quarter,
} from './leaderboard'
import {
  parseActivityDate,
  getTotalPoints,
  isDateFilterActive,
  isCategoryFilterActive,
  isSearchFilterActive,
  matchesSearch,
} from './utils'
import './App.css'

function App() {
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('all')
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all')
  const [searchText, setSearchText] = useState('')

  const filteredLeaderboardUsers = useMemo(() => {
    const hasDateFilter = isDateFilterActive(selectedYear, selectedQuarter)
    const hasCategoryFilter = isCategoryFilterActive(selectedCategory)
    const hasSearch = isSearchFilterActive(searchText)

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
          totalPoints: getTotalPoints(activities),
        }
      })
      .filter((user) => {
        // Hide users with no matching activities when any activity filter is active
        if ((hasDateFilter || hasCategoryFilter) && user.sortedActivities.length === 0) {
          return false
        }
        // Search filter
        if (hasSearch) {
          return matchesSearch(
            searchText,
            user.firstName,
            user.lastName,
            user.position,
            user.unit,
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

      <FilterBar
        selectedYear={selectedYear}
        selectedQuarter={selectedQuarter}
        selectedCategory={selectedCategory}
        searchText={searchText}
        onYearChange={setSelectedYear}
        onQuarterChange={setSelectedQuarter}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearchText}
      />

      {filteredLeaderboardUsers.length === 0 ? (
        <NotFound />
      ) : (
        <>
          <Podium users={filteredLeaderboardUsers} />
          <ListOfUsers users={filteredLeaderboardUsers} />
        </>
      )}
    </main>
  )
}

export default App
