import { create } from 'zustand'

export const useSchemaStore = create((set) => ({
  selectedSchemaKey: 'hr',
  parsedSchema: null,
  customSQL: '',
  isLoading: false,

  setSchema: (selectedSchemaKey) => set({ selectedSchemaKey }),

  parseCustomSchema: async (sql) => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 600))
    set({ parsedSchema: { tables: [] }, customSQL: sql, isLoading: false })
  },

  loadSampleSchema: async (key) => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 500))
    set({ parsedSchema: { tables: [] }, selectedSchemaKey: key, isLoading: false })
  },
}))

