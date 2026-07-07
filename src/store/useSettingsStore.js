import { create } from 'zustand'
import { SETTINGS_STORAGE_KEY, THEME_STORAGE_KEY } from '../constants/config'
import { getAiStatus, testConnection as apiTestConnection } from '../api/settingsApi'
import { useSchemaStore } from './useSchemaStore'

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
  model: 'gemini-1.5-pro',
  aiStatus: 'unknown',
  aiMessage: '',
  connectionStatus: 'idle',
  connectionError: '',
}

export const useSettingsStore = create((set, get) => {
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
    setDbType: (dbType) => set({ dbType }),
    setApiKey: (apiKey) => set((s) => ({ apiKey })),
    setModel: (model) => set((s) => ({ model })),

    loadAiStatus: async () => {
      try {
        const result = await getAiStatus()
        set({
          model: result.model || get().model,
          aiStatus: result.configured ? 'configured' : 'missing',
          aiMessage: result.message || '',
        })
        return result
      } catch (e) {
        set({ aiStatus: 'error', aiMessage: e?.message || 'Unable to read AI status' })
        return { configured: false, message: e?.message || 'Unable to read AI status' }
      }
    },

    testConnection: async () => {
      set({ connectionStatus: 'testing', connectionError: '' })
      const settings = get()
      const payload = {
        host: settings.dbConfig.host,
        port: settings.dbConfig.port,
        dbName: settings.dbConfig.dbName,
        username: settings.dbConfig.username,
        password: settings.dbConfig.password,
        type: settings.dbType === 'postgres' ? 'postgresql' : 'mysql',
      }

      if (!payload.host || !payload.port || !payload.dbName || !payload.username) {
        const message = 'Enter host, port, database name, and username first'
        set({ connectionStatus: 'failed', connectionError: message })
        return { success: false, message }
      }

      try {
        const result = await apiTestConnection(payload)
        set({
          connectionStatus: result.success ? 'connected' : 'failed',
          connectionError: result.success ? '' : result.message || 'Connection failed',
        })
        if (result.success) {
          await useSchemaStore.getState().loadDbSchema(payload)
        }
        return result
      } catch (e) {
        set({ connectionStatus: 'failed', connectionError: e?.message || 'Connection failed' })
        return { success: false, message: e?.message || 'Connection failed' }
      }
    },

    saveSettings: () => {
      set((s) => {
        try {
          const { connectionStatus, connectionError, aiStatus, aiMessage, ...persisted } = s
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(persisted))
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

