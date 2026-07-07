import axios from 'axios'
import { API_BASE_URL, USE_MOCK } from '../constants/config'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const isMock = USE_MOCK
