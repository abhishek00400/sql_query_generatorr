import { create } from 'zustand'
import { SETTINGS_STORAGE_KEY, THEME_STORAGE_KEY } from '../constants/config'

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const defaults = {
  theme: 'dark',
  dbType: 'mysql',
  dbConfig: { host: '', port: '', dbName: '', username: '', password: '' },
  apiKey: '',
  model: 'claude-sonnet-4-6',
  connectionStatus: 'idle',
}

export const useSettingsStore = create((set) => {
  const stored = loadSettings()
  const theme = stored?.theme || (localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark')

  return {
    ...defaults,
    ...stored,
    theme,
    setTheme: (theme) =>
      set((s) => {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, theme)
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...s, theme }))
        } catch {}

        document.documentElement.setAttribute('data-theme', theme)
        document.documentElement.classList.toggle('dark', theme === 'dark')
        return { theme }
      }),

    setDbConfig: (dbConfig) => set((s) => ({ dbConfig })),
    setApiKey: (apiKey) => set((s) => ({ apiKey })),
    setModel: (model) => set((s) => ({ model })),

    testConnection: async () => {
      set({ connectionStatus: 'testing' })
      await new Promise((r) => setTimeout(r, 700))
      set({ connectionStatus: 'connected' })
      return { success: true, message: 'Connected (mock)' }
    },

    saveSettings: () => {
      set((s) => {
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(s))
        } catch {}
        return s
      })
      return true
    },

    resetSettings: () => {
      const next = { ...defaults, theme: defaults.theme }
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next))
        localStorage.setItem(THEME_STORAGE_KEY, next.theme)
      } catch {}
      document.documentElement.setAttribute('data-theme', next.theme)
      document.documentElement.classList.toggle('dark', next.theme === 'dark')
      set(next)
    },
  }
})

