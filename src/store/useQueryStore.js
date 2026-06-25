import { create } from 'zustand'

export const useQueryStore = create((set) => ({
  userInput: '',
  selectedSchema: 'hr',
  step: 1,
  isLoading: false,
  generatedOptions: [],
  selectedOption: null,
  queryResults: null,
  error: null,

  setUserInput: (userInput) => set({ userInput }),
  setSchema: (selectedSchema) => set({ selectedSchema }),

  generateSQL: async () => {
    set({ isLoading: true, error: null })
    await new Promise((r) => setTimeout(r, 1200))
    const mockOptions = []
    set({
      generatedOptions: mockOptions,
      step: 2,
      isLoading: false,
    })
  },

  selectOption: (option) => set({ selectedOption: option, step: 3 }),

  executeQuery: async () => {
    set({ isLoading: true, error: null })
    await new Promise((r) => setTimeout(r, 1200))
    set({ isLoading: false, queryResults: { columns: [], rows: [], rowCount: 0 } })
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

