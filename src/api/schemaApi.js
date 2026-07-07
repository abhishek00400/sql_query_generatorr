import { axiosInstance, isMock } from './client'
import { mockParsedSchema } from '../mock/mockSchema'

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getSampleSchema(key) {
  if (isMock) {
    await delay(600)
    // prompt says: get sample SQL string from constants; for now return parsed mock schema payload
    return { sqlKey: key, parsed: mockParsedSchema }
  }
  // backend can return parsed schema or SQL; align later with backend contract
  const res = await axiosInstance.get(`/schema/sample/${key}`)
  return res.data
}

export async function parseSchema(sqlText, dbConfig) {
  if (isMock) {
    await delay(700)
    return mockParsedSchema
  }
  const res = await axiosInstance.post('/schema/parse', dbConfig ? { dbConfig } : { sql: sqlText })
  return res.data
}
