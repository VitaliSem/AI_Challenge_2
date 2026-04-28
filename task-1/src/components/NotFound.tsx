export function NotFound() {
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
