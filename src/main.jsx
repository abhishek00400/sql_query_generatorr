import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/index.css'
import { THEME_STORAGE_KEY } from './constants/config'

function applySavedTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    const theme = stored === 'light' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark')
    document.documentElement.classList.add('dark')
  }
}

applySavedTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
    </BrowserRouter>
  </React.StrictMode>
)

