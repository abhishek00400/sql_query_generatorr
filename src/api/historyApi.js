import { axiosInstance, isMock } from './client'

export async function saveEntry(entry) {
  if (isMock) return { success: true }
  return axiosInstance.post('/history', entry).then((r) => r.data)
}

export async function getHistory() {
  if (isMock) return []
  return axiosInstance.get('/history').then((r) => r.data)
}

export async function deleteEntry(id) {
  if (isMock) return { success: true }
  return axiosInstance.delete(`/history/${id}`).then((r) => r.data)
}
