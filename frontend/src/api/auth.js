import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8080/api/auth',
  headers: { 'Content-Type': 'application/json' },
})

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const signup = (data) => API.post('/signup', data)

export const login = (data) => API.post('/login', data)

export const verifyOtp = (data) => API.post('/verify-otp', data)

export const resendOtp = (data) => API.post('/resend-otp', data)

export const forgotPassword = (data) => API.post('/forgot-password', data)

export const resetPassword = (data) => API.post('/reset-password', data)

export const validateSponsor = (sponsorId) =>
  API.get(`/validate-sponsor/${sponsorId}`)
