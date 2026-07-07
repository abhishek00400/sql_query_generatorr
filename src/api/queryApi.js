import { axiosInstance, isMock } from './client'
import { mockQueryOptions } from '../mock/mockQueryOptions'

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function generateSQL(input, schema, dbConfig) {
  if (isMock) {
    await delay(1200)
    return { options: mockQueryOptions }
  }

  const res = await axiosInstance.post('/query/generate', { input, schema, dbConfig })
  return res.data
}

export async function executeQuery(sql, dbConfig) {
  if (isMock) {
    await delay(1200)
    // returned columns + rows per prompt executeQuery contract
    const { mockResults } = await import('../mock/mockResults')
    const columns = Object.keys(mockResults[0] || {})
    const rows = mockResults
    return { columns, rows, rowCount: rows.length }
  }

  const res = await axiosInstance.post('/query/execute', { sql, dbConfig })
  return res.data
}
