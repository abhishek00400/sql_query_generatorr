import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Clock, Database, Home, Settings } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Query', icon: Home },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/schema', label: 'Schema', icon: Database },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/70 bg-bg-primary/80 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-4">
        {tabs.map((t) => {
          const active = location.pathname === t.to
          const Icon = t.icon
          return (
            <button
              key={t.to}
              onClick={() => navigate(t.to)}
              className={[
                'flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition',
                active ? 'text-accent' : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              <Icon size={18} className={active ? 'text-accent' : 'text-text-secondary'} />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

