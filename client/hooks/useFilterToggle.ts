import { useState, useEffect } from 'react'

/**
 * Manages a filter dropdown's visibility with click-outside-to-close behavior.
 * Replaces the repeated filterVisible + document.addEventListener('click') pattern.
 */
export function useFilterToggle() {
  const [filterVisible, setFilterVisible] = useState(false)

  useEffect(() => {
    const close = () => setFilterVisible(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const onshow = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFilterVisible((prev) => !prev)
  }

  return { filterVisible, setFilterVisible, onshow, stopPropagation }
}
