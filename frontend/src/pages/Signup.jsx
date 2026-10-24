import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone,
  FiArrowRight, FiShield, FiUsers, FiHash,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { signup, validateSponsor } from '../api/auth'
import { COUNTRY_CODES } from '../data/countryCodes'

function getPasswordStrength(pw) {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { level: 1, label: 'Weak', cls: 'strength-weak' }
  if (score === 2) return { level: 2, label: 'Fair', cls: 'strength-fair' }
  if (score === 3) return { level: 3, label: 'Good', cls: 'strength-good' }
  return { level: 4, label: 'Strong', cls: 'strength-strong' }
}

function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({
    sponsorId: searchParams.get('ref') || '',
    fullName: '',
    email: '',
    countryCode: '+91',
    mobile: '',
    password: '',
    confirmPassword: '',
  })
  const [sponsorName, setSponsorName] = useState('')
  const [sponsorStatus, setSponsorStatus] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const lookupSponsor = useCallback(async (id) => {
    if (!id || id.trim().length < 2) {
      setSponsorName('')
      setSponsorStatus(null)
      return
    }
    setSponsorStatus('loading')
    try {
      const res = await validateSponsor(id.trim())
      setSponsorName(res.data.data.name)
      setSponsorStatus('valid')
    } catch {
      setSponsorName('')
      setSponsorStatus('invalid')
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => lookupSponsor(form.sponsorId), 500)
    return () => clearTimeout(timer)
  }, [form.sponsorId, lookupSponsor])

  const passwordStrength = form.password ? getPasswordStrength(form.password) : null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      toast.error('Please fill in all required fields')
      return
    }
    if (!form.mobile || form.mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number')
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
    if (!agreed) {
      toast.error('Please agree to the Terms & Conditions')
      return
    }

    setLoading(true)
    try {
      const res = await signup({
        sponsorId: form.sponsorId || null,
        fullName: form.fullName,
        email: form.email,
        countryCode: form.countryCode,
        mobile: form.mobile || null,
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
      toast.success(res.data.message || 'OTP sent to your email!')
      const tpeId = res.data.data.tpeId
      navigate('/verify-otp', { state: { email: form.email, tpeId, flow: 'signup' } })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout wide>
      <form onSubmit={handleSubmit} className="auth-card__body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-group__label">
              <FiHash size={14} /> Sponsor ID
            </label>
            <div className="input-wrapper">
              <span className="input-wrapper__icon"><FiHash /></span>
              <input
                type="text"
                name="sponsorId"
                placeholder="Enter Sponsor ID"
                value={form.sponsorId}
                onChange={handleChange}
              />
            </div>
            {sponsorStatus === 'loading' && (
              <span className="sponsor-status sponsor-status--loading">Verifying...</span>
            )}
            {sponsorStatus === 'invalid' && (
              <span className="sponsor-status sponsor-status--invalid">Invalid Sponsor ID</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-group__label">
              <FiUsers size={14} /> Sponsor Name
            </label>
            <div className="input-wrapper">
              <span className="input-wrapper__icon"><FiUsers /></span>
              <input
                type="text"
                placeholder="Sponsor Name"
                value={sponsorName}
                disabled
              />
            </div>
            {sponsorStatus === 'valid' && (
              <span className="sponsor-status sponsor-status--valid">Verified</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-group__label">
            <FiUser size={14} /> Full Name *
          </label>
          <div className="input-wrapper">
            <span className="input-wrapper__icon"><FiUser /></span>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-group__label">
              <FiMail size={14} /> Email *
            </label>
            <div className="input-wrapper">
              <span className="input-wrapper__icon"><FiMail /></span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-group__label">
              <FiPhone size={14} /> Mobile *
            </label>
            <div className="phone-input-row">
              <select
                name="countryCode"
                value={form.countryCode}
                onChange={handleChange}
                className="country-code-select"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <div className="input-wrapper" style={{ flex: 1 }}>
                <span className="input-wrapper__icon"><FiPhone /></span>
                <input
                  type="text"
                  inputMode="numeric"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setForm({ ...form, mobile: val })
                  }}
                />
              </div>
            </div>
            {form.mobile && form.mobile.length > 0 && form.mobile.length < 10 && (
              <span className="form-error">Mobile number must be 10 digits</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-group__label">
              <FiLock size={14} /> Password *
            </label>
            <div className="input-wrapper">
              <span className="input-wrapper__icon"><FiLock /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter Password"
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
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {passwordStrength && (
              <>
                <div className="password-strength">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`password-strength__bar ${
                        i <= passwordStrength.level
                          ? `password-strength__bar--filled ${passwordStrength.cls}`
                          : ''
                      }`}
                    />
                  ))}
                </div>
                <span className={`password-strength__text ${passwordStrength.cls}`}>
                  {passwordStrength.label}
                </span>
              </>
            )}
          </div>

          <div className="form-group">
            <label className="form-group__label">
              <FiLock size={14} /> Confirm Password *
            </label>
            <div className="input-wrapper">
              <span className="input-wrapper__icon"><FiLock /></span>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
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
                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <span className="form-error">Passwords do not match</span>
            )}
          </div>
        </div>

        <label className="checkbox-group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            I agree to the <a href="#terms">Terms &amp; Conditions</a>
          </span>
        </label>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              <FiShield size={18} />
              Sign Up to Continue
              <span className="btn-submit__arrow"><FiArrowRight /></span>
            </>
          )}
        </button>

        <div className="auth-links">
          Already have an account?{' '}
          <Link to="/login">Sign In</Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Signup
