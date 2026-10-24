import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiHash, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { login as loginApi } from '../api/auth'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ userId: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.userId || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await loginApi(form)
      toast.success(res.data.message || 'Login successful!')
      login(res.data.data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="auth-card__body">
        <div className="form-group">
          <label className="form-group__label">
            <FiHash size={14} /> User ID
          </label>
          <div className="input-wrapper">
            <span className="input-wrapper__icon"><FiHash /></span>
            <input
              type="text"
              name="userId"
              placeholder="Enter your TPE ID"
              value={form.userId}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-group__label">
            <FiLock size={14} /> Password
          </label>
          <div className="input-wrapper">
            <span className="input-wrapper__icon"><FiLock /></span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="input-wrapper__toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              <FiShield size={18} />
              Sign In to Continue
              <span className="btn-submit__arrow"><FiArrowRight /></span>
            </>
          )}
        </button>

        <div className="auth-links">
          Don't have an account?{' '}
          <Link to="/signup">Sign Up</Link>
          <span className="auth-links__divider">|</span>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Login
