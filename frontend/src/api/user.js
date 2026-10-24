import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8080/api/user',
  headers: { 'Content-Type': 'application/json' },
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(new Error('Session expired'))
    }
    const message = err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const getProfile = () => API.get('/profile')

export const updateProfile = (data) => API.put('/profile', data)

export const getDashboard = () => API.get('/dashboard')

export const getMyDirects = () => API.get('/my-directs')

export const getMyTeam = () => API.get('/my-team')

export const getGenerationTree = (rootCode) =>
  API.get('/generation-tree', { params: rootCode ? { rootCode } : {} })

export const getLevelInfo = () => API.get('/level-info')
