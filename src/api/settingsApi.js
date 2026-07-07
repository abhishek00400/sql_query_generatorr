import { axiosInstance, isMock } from './client'

export async function testConnection(dbConfig) {
  if (isMock) {
    await new Promise((r) => setTimeout(r, 600))
    return { success: true, message: 'Connected (mock)' }
  }
  const res = await axiosInstance.post('/db/test', dbConfig)
  return res.data
}
