import { useState } from 'react'
import { FaHeart } from 'react-icons/fa'

interface FavoriteButtonProps {
  activeColor?: string
  size?: string | number
}

/**
 * Heart/favorite toggle button.
 * Replaces the repeated colorChange + colorToggle pattern in productbrief-card components.
 */
export function FavoriteButton({
  activeColor = '#ec3f3f',
  size = '32px',
}: FavoriteButtonProps) {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div className="likesIcon icon-container">
      <FaHeart
        className="likesIcon"
        size={size}
        style={{ color: isLiked ? activeColor : '' }}
        onClick={() => setIsLiked((prev) => !prev)}
      />
    </div>
  )
}
