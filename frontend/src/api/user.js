import axios from 'axios'
import { refreshToken as refreshTokenApi } from './auth'

const API = axios.create({
  baseURL: 'http://localhost:8080/api/user',
  headers: { 'Content-Type': 'application/json' },
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      const storedRefreshToken = localStorage.getItem('refreshToken')

      if (!storedRefreshToken) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('refreshToken')
        localStorage.setItem('session_expired', 'true')
        window.location.href = '/login'
        return Promise.reject(new Error('Session expired'))
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return API(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      return refreshTokenApi({ refreshToken: storedRefreshToken })
        .then((res) => {
          const data = res.data.data
          localStorage.setItem('token', data.token)
          localStorage.setItem('refreshToken', data.refreshToken)

          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser)
              user.token = data.token
              user.refreshToken = data.refreshToken
              localStorage.setItem('user', JSON.stringify(user))
            } catch { /* ignore parse errors */ }
          }

          API.defaults.headers.common.Authorization = `Bearer ${data.token}`
          processQueue(null, data.token)

          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return API(originalRequest)
        })
        .catch((refreshErr) => {
          processQueue(refreshErr, null)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('refreshToken')
          localStorage.setItem('session_expired', 'true')
          window.location.href = '/login'
          return Promise.reject(new Error('Session expired'))
        })
        .finally(() => {
          isRefreshing = false
        })
    }

    const message = err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const getProfile = () => API.get('/profile')

export const updateProfile = (data) => API.put('/profile', data)

export const getDashboard = () => API.get('/dashboard')

export const getMyDirects = (rootCode) =>
  API.get('/my-directs', { params: rootCode ? { rootCode } : {} })

export const getMyTeam = (rootCode) =>
  API.get('/my-team', { params: rootCode ? { rootCode } : {} })

export const getGenerationTree = (rootCode) =>
  API.get('/generation-tree', { params: rootCode ? { rootCode } : {} })

export const getLevelInfo = (rootCode) =>
  API.get('/level-info', { params: rootCode ? { rootCode } : {} })

export const getLevelMembers = (level, rootCode) =>
  API.get('/level-members', { params: { level, ...(rootCode ? { rootCode } : {}) } })

export const getAllMembers = (filter) => API.get('/all-members', { params: { filter } })
