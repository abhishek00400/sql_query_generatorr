import React from 'react'
import Topbar from './Topbar'
import BottomNav from './BottomNav'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-ui">
      <Topbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

