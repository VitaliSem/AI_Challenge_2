import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from '../icons/Icons'

interface CustomSelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  options: CustomSelectOption[]
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
  placeholder?: string
}

/**
 * Custom select component with full styling control
 * Replaces native HTML select for consistent styling across browsers
 */
export function CustomSelect({
  options,
  value,
  onChange,
  ariaLabel,
  placeholder,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder || ''

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setIsOpen(true)
    }
  }

  return (
    <div className="custom-select" ref={containerRef}>
      <button
        type="button"
        className="custom-select__trigger"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        {...(ariaLabel && { 'aria-label': ariaLabel })}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="custom-select__value">{selectedLabel}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <ul className="custom-select__menu" role="listbox">
          {options.map((option) => (
            <li key={option.value} role="option">
              <button
                type="button"
                className={`custom-select__option ${
                  value === option.value ? 'is-selected' : ''
                }`}
                onClick={() => handleSelect(option.value)}
                aria-selected={value === option.value}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
