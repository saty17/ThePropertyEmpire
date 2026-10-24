import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { FiCheckCircle, FiMail, FiArrowRight } from 'react-icons/fi'
import AuthLayout from '../components/AuthLayout'

export default function RegistrationSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const details = location.state?.userDetails

  if (!details) {
    return <Navigate to="/login" replace />
  }

  return (
    <AuthLayout title="Registration Successful">
      <div className="auth-card__body registration-success">
        <div className="success-icon">
          <FiCheckCircle size={48} />
        </div>

        <h3 className="success-title">Welcome to The Property Empire!</h3>
        <p className="success-subtitle">Your account has been created successfully.</p>

        <div className="details-card">
          <div className="detail-row">
            <span className="detail-label">Your TPE ID</span>
            <span className="detail-value detail-value--highlight">{details.tpeId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{details.fullName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value">{details.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Mobile</span>
            <span className="detail-value">{details.countryCode} {details.mobile}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Joined</span>
            <span className="detail-value">{details.joinedDate}</span>
          </div>
        </div>

        <div className="email-info">
          <FiMail size={16} />
          <span>We have sent your account details to your registered email.</span>
        </div>

        <button className="btn-submit" onClick={() => navigate('/login')}>
          Login to Your Account
          <span className="btn-submit__arrow"><FiArrowRight /></span>
        </button>
      </div>
    </AuthLayout>
  )
}
