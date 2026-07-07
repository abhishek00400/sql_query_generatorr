import axios from 'axios'
import { API_BASE_URL, USE_MOCK } from '../constants/config'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error?.response?.data?.detail
    if (typeof detail === 'string') {
      error.message = detail
    } else if (Array.isArray(detail)) {
      error.message = detail.map((item) => item?.msg || JSON.stringify(item)).join(', ')
    } else if (error?.code === 'ERR_NETWORK') {
      error.message = `Cannot reach backend at ${API_BASE_URL || 'the configured API URL'}`
    }
    return Promise.reject(error)
  }
)

export const isMock = USE_MOCK
