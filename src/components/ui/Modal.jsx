import React, { useEffect, useRef } from 'react'

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'warning',
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const prevActive = document.activeElement

    function handleKey(e) {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'Tab') {
        const node = ref.current
        if (!node) return
        const focusable = Array.from(
          node.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
        ).filter((el) => !el.hasAttribute('disabled'))
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKey)

    const t = setTimeout(() => {
      const node = ref.current
      if (!node) return
      const btn = node.querySelector('button[data-primary="true"], button, [tabindex]')
      btn?.focus?.()
    }, 0)

    return () => {
      document.removeEventListener('keydown', handleKey)
      clearTimeout(t)
      prevActive?.focus?.()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const variantCls =
    confirmVariant === 'danger'
      ? 'bg-danger text-white hover:bg-danger/90'
      : confirmVariant === 'warning'
        ? 'bg-warning text-black hover:bg-warning/90'
        : 'bg-accent text-white hover:bg-accent-hover'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        ref={ref}
        className="relative w-full max-w-lg rounded-xl border border-border bg-bg-elevated/95 p-5 shadow-accent"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-bold text-text-primary">{title}</div>
            <div className="mt-2 text-sm text-text-secondary">{message}</div>
          </div>
          <button
            type="button"
            className="rounded-lg border border-border bg-bg-surface/30 px-2 py-1 text-text-secondary hover:text-text-primary"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-border bg-bg-surface/30 px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            data-primary="true"
            className={["rounded-lg px-4 py-2 text-sm font-bold transition", variantCls].join(' ')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

