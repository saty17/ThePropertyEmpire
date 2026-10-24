import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiCopy, FiUsers, FiGitBranch, FiUser, FiAward, FiArrowRight,
  FiShare2, FiCheck, FiStar, FiTrendingUp,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { getDashboard } from '../../api/user'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const referralLink = `${window.location.origin}/signup?ref=${user?.tpeId || ''}`

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data.data))
      .catch(() => setStats({ totalDirects: 0, totalTeamSize: 0, level: 0 }))
      .finally(() => setLoading(false))
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`Join The Property Empire! Sign up using my referral link: ${referralLink}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const shareTelegram = () => {
    const msg = encodeURIComponent('Join The Property Empire!')
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${msg}`, '_blank')
  }

  const shareEmail = () => {
    const subject = encodeURIComponent('Join The Property Empire')
    const body = encodeURIComponent(`Hey,\n\nI'd like to invite you to join The Property Empire. Sign up here:\n${referralLink}\n\nLooking forward to having you on the team!`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const s = stats || {}

  return (
    <div className="dash-home">
      <div className="welcome-card">
        <div className="welcome-card__left">
          <img src="/assets/logo.jpeg" alt="TPE" className="welcome-card__logo" />
          <div>
            <p className="welcome-card__label">Welcome back</p>
            <h2 className="welcome-card__name">{user?.fullName}</h2>
            <div className="welcome-card__badges">
              <span className="badge badge--code">{user?.tpeId}</span>
              <span className="badge badge--confirmed">Confirmed</span>
            </div>
            <button className="btn-copy-link" onClick={copyLink}>
              {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
              {copied ? 'Copied!' : 'Copy Affiliate Link'}
            </button>
          </div>
        </div>
        <div className="welcome-card__stats">
          <div className="welcome-stat">
            <FiTrendingUp size={18} />
            <div>
              <span className="welcome-stat__value">{loading ? '...' : s.totalDirects ?? 0}</span>
              <span className="welcome-stat__label">Direct Referrals</span>
            </div>
          </div>
          <div className="welcome-stat">
            <FiUsers size={18} />
            <div>
              <span className="welcome-stat__value">{loading ? '...' : s.totalTeamSize ?? 0}</span>
              <span className="welcome-stat__label">Total Team</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Current Rank', value: loading ? '...' : 'Member', icon: FiAward, cls: 'rank' },
          { label: 'Direct Referrals', value: loading ? '...' : s.totalDirects ?? 0, icon: FiArrowRight, cls: 'direct' },
          { label: 'Total Team', value: loading ? '...' : s.totalTeamSize ?? 0, icon: FiUsers, cls: 'team' },
          { label: 'Account Level', value: loading ? '...' : s.level ?? 0, icon: FiStar, cls: 'level' },
        ].map((c) => (
          <div key={c.label} className={`stat-card stat-card--${c.cls}`}>
            <div className="stat-card__icon"><c.icon size={22} /></div>
            <div>
              <span className="stat-card__value">{c.value}</span>
              <span className="stat-card__label">{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="refer-banner">
        <div className="refer-banner__content">
          <FiShare2 size={24} />
          <div>
            <h3>Share your referral link and grow your network!</h3>
            <div className="refer-banner__link">
              <input readOnly value={referralLink} onClick={(e) => e.target.select()} />
              <button onClick={copyLink}>{copied ? <FiCheck size={16} /> : <FiCopy size={16} />}</button>
            </div>
            <div className="refer-banner__share">
              <button className="share-btn share-btn--wa" onClick={shareWhatsApp}>WhatsApp</button>
              <button className="share-btn share-btn--tg" onClick={shareTelegram}>Telegram</button>
              <button className="share-btn share-btn--email" onClick={shareEmail}>Email</button>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions__grid">
          {[
            { label: 'View My Team', icon: FiUsers, to: '/dashboard/network/my-team' },
            { label: 'Generation Tree', icon: FiGitBranch, to: '/dashboard/network/generation-tree' },
            { label: 'Edit Profile', icon: FiUser, to: '/dashboard/profile' },
          ].map((a) => (
            <button key={a.label} className="quick-action-card" onClick={() => navigate(a.to)}>
              <a.icon size={24} />
              <span>{a.label}</span>
              <FiArrowRight size={16} className="quick-action-card__arrow" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
