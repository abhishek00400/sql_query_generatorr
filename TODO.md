# QueryMind AI Frontend TODO

## Planned next implementation steps
1. Build API layer + axios client + mock layer
   - `src/api/client.js`
   - `src/api/queryApi.js`, `schemaApi.js`, `historyApi.js`, `settingsApi.js`
   - mock data: `src/mock/mockQueryOptions.js`, `src/mock/mockResults.js`, `src/mock/mockSchema.js`

2. Implement hooks + utilities
   - `src/hooks/useTypewriter.js`, `useClipboard.js`, `useLocalStorage.js`, `useExport.js`
   - `src/utils/schemaParser.js`, `queryClassifier.js`, `formatters.js`, `validators.js`

3. Constants
   - `src/constants/samplePrompts.js`, `src/constants/sampleSchemas.js`

4. Full UI component set
   - Shared: `Modal`, `Badge`, `Spinner`, `EmptyState`, `StepIndicator`, plus query/results components
   - Query components: `InputSection`, `SchemaSelector`, `QueryResults`, `QueryTabs`, `QueryCard`, typewriter SQL pieces, `ExecutePanel`
   - Results: `ResultsTable`, `Pagination`, `ExportButtons`
   - History: `HistoryFilters`, `HistoryCard`
   - Schema: `SchemaImport`, `SchemaCard`

5. Finish pages wiring
   - Replace placeholder pages with the fully wired implementations.

6. README + backend integration guide
   - Update `README.md` with setup, env vars, file structure, and every `// BACKEND INTEGRATION` comment list.

## Progress
- [x] Scaffold root project files and base app/layout/styles/stores
- [ ] Implement remaining files per prompt (API/hooks/utils/components/pages/README)

