import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiHash, FiArrowRight, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { forgotPassword } from '../api/auth'

function ForgotPassword() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId) {
      toast.error('Please enter your TPE ID')
      return
    }
    setLoading(true)
    try {
      const res = await forgotPassword({ userId })
      toast.success(res.data.message || 'OTP sent to your registered email!')
      navigate('/reset-password', { state: { userId } })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset your password">
      <form onSubmit={handleSubmit} className="auth-card__body">
        <div className="form-group">
          <label className="form-group__label">
            <FiHash size={14} /> TPE User ID
          </label>
          <div className="input-wrapper">
            <span className="input-wrapper__icon"><FiHash /></span>
            <input
              type="text"
              placeholder="Enter your TPE ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              <FiShield size={18} />
              Submit
              <span className="btn-submit__arrow"><FiArrowRight /></span>
            </>
          )}
        </button>

        <div className="auth-links">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default ForgotPassword
