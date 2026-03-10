import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('darkMode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored !== null ? stored === 'true' : prefersDark
    setIsDark(initial)
    document.documentElement.classList.toggle('dark', initial)
  }, [])

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('darkMode', String(next))
      return next
    })
  }

  return { isDark, toggle }
}
