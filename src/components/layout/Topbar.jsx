import React from 'react'
import { NavLink } from 'react-router-dom'
import { Database, Menu, Moon, Sun } from 'lucide-react'
import { useSettingsStore } from '../../store/useSettingsStore'

function ThemeToggle() {
  const { theme, setTheme } = useSettingsStore()

  const isLight = theme === 'light'
  return (
    <button
      type="button"
      onClick={() => {
        const next = isLight ? 'dark' : 'light'
        setTheme(next)
      }}
      className="inline-flex items-center justify-center rounded-lg border border-border bg-bg-elevated/60 px-3 py-2 text-text-secondary hover:border-accent hover:text-text-primary transition"
      aria-label="Toggle theme"
    >
      {isLight ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

export default function Topbar() {
  const { connectionStatus } = useSettingsStore()

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-bg-primary/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-elevated border border-border shadow-accent/30">
            <Database className="text-accent" size={18} />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-text-primary">QueryMind AI</div>
            <div className="text-xs text-text-muted">Natural Language → SQL</div>
          </div>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {[
            { to: '/', label: 'Query' },
            { to: '/history', label: 'History' },
            { to: '/schema', label: 'Schema' },
            { to: '/settings', label: 'Settings' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'text-sm font-semibold transition',
                  isActive ? 'text-accent underline underline-offset-4' : 'text-text-secondary hover:text-text-primary',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span
              className={[
                'h-2.5 w-2.5 rounded-full',
                connectionStatus === 'connected' ? 'bg-success' : 'bg-text-muted/60',
              ].join(' ')}
            />
            <span className="text-xs text-text-muted">{connectionStatus === 'connected' ? 'Connected' : 'Not connected'}</span>
          </div>

          <ThemeToggle />

          <button className="md:hidden inline-flex items-center justify-center rounded-lg border border-border bg-bg-elevated/60 p-2 text-text-secondary" aria-label="Menu">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}

