import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import QueryPage from './pages/QueryPage'
import HistoryPage from './pages/HistoryPage'
import SchemaPage from './pages/SchemaPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const location = useLocation()

  return (
    <Layout activePath={location.pathname}>
      <Routes>
        <Route path="/" element={<QueryPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/schema" element={<SchemaPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  )
}

