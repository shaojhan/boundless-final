import { useState, useEffect } from 'react'
import { FaHeart } from 'react-icons/fa'
import { authFetch } from '@/lib/api-client'
import styles from './FavoriteButton.module.scss'

interface FavoriteButtonProps {
  pid?: number
  activeColor?: string
  size?: string | number
}

/**
 * Heart/favorite toggle button.
 * If `pid` is provided, syncs state with the backend API.
 */
export function FavoriteButton({
  pid,
  activeColor = '#ec3f3f',
  size = '32px',
}: FavoriteButtonProps) {
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    if (!pid) return
    authFetch(`/api/favorite/status/${pid}`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.isFavorited === 'boolean') {
          setIsLiked(data.isFavorited)
        }
      })
      .catch(() => {})
  }, [pid])

  const handleClick = async () => {
    if (!pid) {
      setIsLiked((prev) => !prev)
      return
    }
    const nextLiked = !isLiked
    setIsLiked(nextLiked)
    try {
      await authFetch(`/api/favorite/${pid}`, {
        method: nextLiked ? 'POST' : 'DELETE',
      })
    } catch {
      setIsLiked(!nextLiked)
    }
  }

  return (
    <div className="likesIcon icon-container">
      <FaHeart
        className={`likesIcon ${isLiked ? styles.liked : ''}`}
        size={size}
        style={{ '--active-color': activeColor } as React.CSSProperties}
        onClick={handleClick}
      />
    </div>
  )
}
