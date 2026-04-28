/**
 * Reusable icon components used across the application
 */

export function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 2.8 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2L3 9.4l6.2-.9L12 2.8Z" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="search-icon-svg">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4 4" />
    </svg>
  )
}

export function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="select-chevron">
      <path d="m5 7 5 5 5-5" />
    </svg>
  )
}

export function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={expanded ? 'rotated' : ''}>
      <path d="m6 14 6-6 6 6" />
    </svg>
  )
}

interface CategoryIconProps {
  category: 'public speaking' | 'education' | 'university partnership'
}

export function CategoryIcon({ category }: CategoryIconProps) {
  if (category === 'public speaking') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5h16v10H4z" />
        <path d="M12 15v4" />
        <path d="M8.5 19h7" />
      </svg>
    )
  }

  if (category === 'education') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 9 12 5l8.5 4-8.5 4-8.5-4Z" />
        <path d="M7 11.2v3.1c0 1.4 2.2 2.9 5 2.9s5-1.5 5-2.9v-3.1" />
      </svg>
    )
  }

  // university partnership (default)
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
      <path d="M8.5 14c1 .9 2.2 1.4 3.5 1.4s2.5-.5 3.5-1.4" />
    </svg>
  )
}
