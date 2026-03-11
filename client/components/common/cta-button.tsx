import React from 'react'
import styles from './cta-button.module.scss'

interface CTAButtonProps {
  color?: string
}

export default function CTAButton({ color }: CTAButtonProps) {
  return (
    <button
      className={styles.btn}
      style={{ '--btn-bg': color } as React.CSSProperties}
    >
      CTAButton
    </button>
  )
}
