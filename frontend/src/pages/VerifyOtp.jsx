import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { verifyOtp, verifyLoginOtp, resendOtp } from '../api/auth'
import { useAuth } from '../context/AuthContext'

function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const email = location.state?.email || ''
  const tpeId = location.state?.tpeId || ''
  const flow = location.state?.flow || 'login'

  const [otp, setOtp] = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(60)
  const inputs = useRef([])

  useEffect(() => {
    if (!email && !tpeId) {
      navigate('/login', { replace: true })
      return
    }
    inputs.current[0]?.focus()
  }, [email, tpeId, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const handleInput = (index, value) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      if (flow === 'login') {
        const res = await verifyLoginOtp({ tpeId, otp: code })
        toast.success(res.data.message || 'Login successful!')
        login(res.data.data)
        navigate('/dashboard', { replace: true })
      } else {
        const res = await verifyOtp({ tpeId, otp: code, otpType: 'FORGOT_PASSWORD' })
        toast.success(res.data.message || 'Verified successfully!')
        navigate('/reset-password', { state: { userId: tpeId } })
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      const otpType = flow === 'login' ? 'LOGIN' : 'FORGOT_PASSWORD'
      await resendOtp({ tpeId, otpType })
      toast.success('OTP resent successfully!')
      setCooldown(60)
      setOtp(Array(6).fill(''))
      inputs.current[0]?.focus()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const masked = email
    ? email.replace(/(.{2}).+(@.+)/, '$1***$2')
    : ''

  return (
    <AuthLayout title="Enter Verification Code">
      <form onSubmit={handleSubmit} className="auth-card__body">
        <p className="otp-info">
          We've sent a 6-digit code to <strong>{masked}</strong>
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
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              <FiShield size={18} />
              Verify
              <span className="btn-submit__arrow"><FiArrowRight /></span>
            </>
          )}
        </button>

        <div className="resend-row">
          {cooldown > 0 ? (
            <span>Resend OTP in {cooldown}s</span>
          ) : (
            <button type="button" onClick={handleResend}>
              Resend OTP
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  )
}

export default VerifyOtp
