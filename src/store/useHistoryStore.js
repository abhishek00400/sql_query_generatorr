import { create } from 'zustand'
import { HISTORY_STORAGE_KEY } from '../constants/config'
import { getHistory, deleteEntry } from '../api/historyApi'

export const useHistoryStore = create((set, get) => ({
  entries: [],
  filters: { search: '', type: 'all', dateRange: 'all' },
  filteredEntries: [],

  loadFromStorage: async () => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        set({ entries: Array.isArray(parsed) ? parsed : parsed.entries || [] })
        return
      }

      const response = await getHistory()
      const apiEntries = Array.isArray(response) ? response : response?.entries || []
      set({ entries: apiEntries })
    } catch {
      set({ entries: [] })
    }
  },

  addEntry: (entry) => {
    set((s) => {
      const next = [{ id: String(Date.now()), ...entry, createdAt: new Date().toISOString() }, ...s.entries]
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return { entries: next }
    })
  },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

  deleteEntry: async (id) => {
    await deleteEntry(id)
    set((s) => {
      const next = s.entries.filter((e) => String(e.id) !== String(id))
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return { entries: next }
    })
  },

  clearAll: () => {
    set({ entries: [] })
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY)
    } catch {}
  },
}))

