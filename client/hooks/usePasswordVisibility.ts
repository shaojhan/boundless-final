import { useState } from 'react'

export function usePasswordVisibility() {
  const [isVisible, setIsVisible] = useState(false)
  const toggle = () => setIsVisible((v) => !v)
  return { isVisible, toggle }
}
