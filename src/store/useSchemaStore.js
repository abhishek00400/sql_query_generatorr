import { create } from 'zustand'
import { getSampleSchema, parseSchema } from '../api/schemaApi'

export const useSchemaStore = create((set, get) => ({
  selectedSchemaKey: 'hr',
  parsedSchema: null,
  customSQL: '',
  dbConfig: null,
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
      set({ customSQL: sqlText, parsedSchema: res, isLoading: false, selectedSchemaKey: 'custom', dbConfig: null })
      return res
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  loadDbSchema: async (dbConfig) => {
    set({ isLoading: true })
    try {
      const res = await parseSchema('', dbConfig)
      set({ parsedSchema: res, selectedSchemaKey: 'database', dbConfig, isLoading: false })
      return res
    } catch (e) {
      set({ isLoading: false, parsedSchema: null })
      throw e
    }
  },

  loadSampleSchema: async (key) => {
    await get().setSchema(key)
  },
}))

