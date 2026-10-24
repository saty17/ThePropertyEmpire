import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { resetPassword, resendOtp } from '../api/auth'

function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.userId || ''

  const [otp, setOtp] = useState(Array(6).fill(''))
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(60)
  const inputs = useRef([])

  useEffect(() => {
    if (!userId) {
      navigate('/forgot-password', { replace: true })
      return
    }
    inputs.current[0]?.focus()
  }, [userId, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const handleOtpInput = (index, value) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').split('').slice(0, 6)
      const next = [...otp]
      digits.forEach((d, i) => {
        if (index + i < 6) next[index + i] = d
      })
      setOtp(next)
      const focusIdx = Math.min(index + digits.length, 5)
      inputs.current[focusIdx]?.focus()
      return
    }
    const digit = value.replace(/\D/g, '')
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }
    if (!form.password || !form.confirmPassword) {
      toast.error('Please fill in both password fields')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await resetPassword({
        userId,
        otp: code,
        newPassword: form.password,
        confirmNewPassword: form.confirmPassword,
      })
      toast.success(res.data.message || 'Password reset successful!')
      navigate('/login')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await resendOtp({ tpeId: userId, otpType: 'FORGOT_PASSWORD' })
      toast.success('OTP resent successfully!')
      setCooldown(60)
      setOtp(Array(6).fill(''))
      inputs.current[0]?.focus()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const masked = userId ? userId.slice(0, 5) + '***' : ''

  return (
    <AuthLayout title="Reset Your Password">
      <form onSubmit={handleSubmit} className="auth-card__body">
        <p className="otp-info">
          Enter the 6-digit code sent to your registered email for <strong>{masked}</strong> and your new password.
        </p>

        <div className="otp-container">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="otp-input"
              value={digit}
              onChange={(e) => handleOtpInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>

        <div className="resend-row">
          {cooldown > 0 ? (
            <span>Resend OTP in {cooldown}s</span>
          ) : (
            <button type="button" onClick={handleResend}>
              Resend OTP
            </button>
          )}
        </div>

        <div className="form-group">
          <label className="form-group__label">
            <FiLock size={14} /> New Password
          </label>
          <div className="input-wrapper">
            <span className="input-wrapper__icon"><FiLock /></span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter new password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
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

        <div className="form-group">
          <label className="form-group__label">
            <FiLock size={14} /> Confirm New Password
          </label>
          <div className="input-wrapper">
            <span className="input-wrapper__icon"><FiLock /></span>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="input-wrapper__toggle"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
            >
              {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {form.confirmPassword && form.password !== form.confirmPassword && (
            <span className="form-error">Passwords do not match</span>
          )}
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              <FiShield size={18} />
              Reset Password
              <span className="btn-submit__arrow"><FiArrowRight /></span>
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
