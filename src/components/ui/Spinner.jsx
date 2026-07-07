import React from 'react'

export default function Spinner({ size = 'md' }) {
  const px = size === 'sm' ? 16 : size === 'lg' ? 40 : 24
  return (
    <span
      className="inline-block animate-spin rounded-full"
      style={{
        width: px,
        height: px,
        border: `3px solid var(--accent-glow)`,
        borderTopColor: 'var(--accent)',
      }}
      aria-label="Loading"
    />
  )
}

