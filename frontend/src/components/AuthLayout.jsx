import { FiShield } from 'react-icons/fi'
import '../styles/auth.css'

function AuthLayout({ children, title, wide }) {
  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-grid" />
        <div className="auth-bg-glow auth-bg-glow--green" />
        <div className="auth-bg-glow auth-bg-glow--gold" />
      </div>

      <div className={`auth-card-wrapper${wide ? ' auth-card-wrapper--wide' : ''}`}>
        <div className="auth-card">
          <div className="auth-card__header">
            <img
              src="/assets/logo.jpeg"
              alt="The Property Empire"
              className="auth-card__logo"
            />
            <h1 className="auth-card__title">
              Secure <span className="text-gold">Authentication</span>
            </h1>
            <div className="auth-card__shield">
              <FiShield size={24} />
            </div>
          </div>

          {title && <h2 className="auth-card__subtitle">{title}</h2>}

          <div className="auth-card__body">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
