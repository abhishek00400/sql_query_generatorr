import { create } from 'zustand'
import { generateSQL, executeQuery } from '../api/queryApi'
import { useSettingsStore } from './useSettingsStore'
import { useSchemaStore } from './useSchemaStore'

export const useQueryStore = create((set, get) => ({
  // State shape per prompt
  userInput: '',
  step: 1, // 1 | 2 | 3
  isLoading: false,
  generatedOptions: [], // [{sql, explanation, tables, impact, validation}]
  selectedOption: null,
  queryResults: null,
  error: null,

  setUserInput: (userInput) => set({ userInput }),

  generateSQL: async () => {
    const input = get().userInput
    const schemaState = useSchemaStore.getState()
    const selectedSchema = schemaState.selectedSchemaKey || 'hr'
    const { dbConfig } = useSettingsStore.getState()
    const schema = selectedSchema || 'hr'

    set({ isLoading: true, error: null })
    try {
      const res = await generateSQL(input, schema, dbConfig)
      set({
        generatedOptions: res?.options || [],
        selectedOption: null,
        queryResults: null,
        step: 2,
        isLoading: false,
      })
    } catch (e) {
      set({ error: e?.message || 'Failed to generate SQL', isLoading: false })
    }
  },

  selectOption: (option) => set({ selectedOption: option, step: 3, queryResults: null }),

  executeQuery: async (sqlOverride) => {
    const { selectedOption } = get()
    const sql = sqlOverride || selectedOption?.sql || ''
    const { dbConfig } = useSettingsStore.getState()

    set({ isLoading: true, error: null })
    try {
      const res = await executeQuery(sql, dbConfig)
      set({
        isLoading: false,
        queryResults: { columns: res?.columns || [], rows: res?.rows || [], rowCount: res?.rowCount || 0 },
        step: 3,
      })
    } catch (e) {
      set({ error: e?.message || 'Failed to execute query', isLoading: false })
    }
  },

  reset: () =>
    set({
      userInput: '',
      selectedSchema: 'hr',
      step: 1,
      isLoading: false,
      generatedOptions: [],
      selectedOption: null,
      queryResults: null,
      error: null,
    }),
}))


