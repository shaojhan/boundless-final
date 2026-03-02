import { useState } from 'react'

/**
 * Manages mobile menu and sidebar visibility toggles.
 * Replaces the repeated showMenu + showSidebar useState pattern across pages.
 */
export function useMenuToggle() {
  const [showMenu, setShowMenu] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  const menuMbToggle = () => setShowMenu((prev) => !prev)
  const sidebarToggle = () => setShowSidebar((prev) => !prev)

  return {
    showMenu,
    setShowMenu,
    menuMbToggle,
    showSidebar,
    setShowSidebar,
    sidebarToggle,
  }
}
