import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setReady(true)
  }, [])

  const loginUser = useCallback((data) => {
    setToken(data.token)
    setUser(data)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }, [navigate])

  const updateUser = useCallback((updated) => {
    const merged = { ...user, ...updated }
    setUser(merged)
    localStorage.setItem('user', JSON.stringify(merged))
  }, [user])

  if (!ready) return null

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login: loginUser, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
