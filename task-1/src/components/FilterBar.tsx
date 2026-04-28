import type { ActivityCategory } from '../data/mockUsers'
import {
  availableYears,
  CATEGORY_LABELS_FILTER,
  QUARTER_LABELS,
  type Quarter,
} from '../leaderboard'
import { SearchIcon } from '../icons/Icons'
import { CustomSelect } from './CustomSelect'

interface FilterBarProps {
  selectedYear: string
  selectedQuarter: Quarter
  selectedCategory: ActivityCategory | 'all'
  searchText: string
  onYearChange: (value: string) => void
  onQuarterChange: (value: Quarter) => void
  onCategoryChange: (value: ActivityCategory | 'all') => void
  onSearchChange: (value: string) => void
}

export function FilterBar({
  selectedYear,
  selectedQuarter,
  selectedCategory,
  searchText,
  onYearChange,
  onQuarterChange,
  onCategoryChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="filters-bar">
      <div className="filters-bar__row">
        <div className="filter-select-wrap">
          <span className="sr-only">Filter by year</span>
          <CustomSelect
            options={[
              { value: 'all', label: 'All Years' },
              ...availableYears.map((year) => ({
                value: String(year),
                label: String(year),
              })),
            ]}
            value={selectedYear}
            onChange={onYearChange}
            placeholder="Select year"
          />
        </div>

        <div className="filter-select-wrap">
          <span className="sr-only">Filter by quarter</span>
          <CustomSelect
            options={(Object.keys(QUARTER_LABELS) as Quarter[]).map((quarter) => ({
              value: quarter,
              label: QUARTER_LABELS[quarter],
            }))}
            value={selectedQuarter}
            onChange={(value) => onQuarterChange(value as Quarter)}
            placeholder="Select quarter"
          />
        </div>

        <div className="filter-select-wrap">
          <span className="sr-only">Filter by category</span>
          <CustomSelect
            options={(Object.keys(CATEGORY_LABELS_FILTER) as (ActivityCategory | 'all')[]).map(
              (category) => ({
                value: category,
                label: CATEGORY_LABELS_FILTER[category],
              }),
            )}
            value={selectedCategory}
            onChange={(value) => onCategoryChange(value as ActivityCategory | 'all')}
            placeholder="Select category"
          />
        </div>

        <label className="search-wrap">
          <span className="sr-only">Search employees</span>
          <SearchIcon />
          <input
            type="search"
            className="search-input"
            placeholder="Search employee..."
            value={searchText}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
      </div>
    </div>
  )
}
