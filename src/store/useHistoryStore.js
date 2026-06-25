import { create } from 'zustand'
import { HISTORY_STORAGE_KEY } from '../constants/config'

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export const useHistoryStore = create((set) => {
  const entries = loadHistory()
  return {
    entries,
    filters: { search: '', type: 'all', dateRange: 'all' },

    filteredEntries: entries,

    addEntry: (entry) =>
      set((s) => {
        const nextEntries = [entry, ...s.entries]
        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextEntries))
        } catch {}
        return { entries: nextEntries }
      }),

    deleteEntry: (id) =>
      set((s) => {
        const nextEntries = s.entries.filter((e) => e.id !== id)
        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextEntries))
        } catch {}
        return { entries: nextEntries }
      }),

    clearAll: () =>
      set(() => {
        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]))
        } catch {}
        return { entries: [], filteredEntries: [] }
      }),

    setFilters: (filters) => set({ filters }),

    loadFromStorage: () =>
      set(() => {
        const entries2 = loadHistory()
        return { entries: entries2, filteredEntries: entries2 }
      }),
  }
})

