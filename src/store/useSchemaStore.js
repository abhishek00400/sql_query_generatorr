import { create } from 'zustand'
import { getSampleSchema, parseSchema } from '../api/schemaApi'

export const useSchemaStore = create((set, get) => ({
  selectedSchemaKey: 'hr',
  parsedSchema: null,
  customSQL: '',
  isLoading: false,

  setSchema: async (key) => {
    set({ selectedSchemaKey: key, isLoading: true })
    if (key === 'custom') {
      set({ isLoading: false })
      return
    }
    try {
      const res = await getSampleSchema(key)
      set({ selectedSchemaKey: key, parsedSchema: res.parsed, isLoading: false })
    } catch {
      set({ isLoading: false, parsedSchema: null })
    }
  },

  setCustomSQL: (sql) => set({ customSQL: sql }),

  parseCustomSchema: async (sqlText) => {
    set({ isLoading: true })
    try {
      const res = await parseSchema(sqlText)
      set({ customSQL: sqlText, parsedSchema: res, isLoading: false, selectedSchemaKey: 'custom' })
    } catch {
      set({ isLoading: false })
    }
  },

  loadDbSchema: async (dbConfig) => {
    set({ isLoading: true })
    try {
      const res = await parseSchema('', dbConfig)
      set({ parsedSchema: res, selectedSchemaKey: 'hr', isLoading: false })
    } catch {
      set({ isLoading: false, parsedSchema: null })
    }
  },

  loadSampleSchema: async (key) => {
    await get().setSchema(key)
  },
}))

