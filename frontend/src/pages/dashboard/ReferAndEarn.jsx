import { useState, useEffect } from 'react'
import { FiShare2, FiCopy, FiCheck, FiUsers, FiArrowRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { getDashboard } from '../../api/user'

export default function ReferAndEarn() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState(null)

  const referralLink = `${window.location.origin}/signup?ref=${user?.tpeId || ''}`

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Join The Property Empire and start your journey in premium real estate! Sign up using my referral link:\n${referralLink}`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const shareTelegram = () => {
    const msg = encodeURIComponent('Join The Property Empire - Premium Real Estate Network!')
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${msg}`, '_blank')
  }

  const shareEmail = () => {
    const subject = encodeURIComponent('Join The Property Empire')
    const body = encodeURIComponent(
      `Hello,\n\nI'd like to invite you to join The Property Empire — a premium real estate network.\n\nSign up using my referral link:\n${referralLink}\n\nLooking forward to building together!`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="dash-page">
      <div className="page-header">
        <h2 className="page-title"><FiShare2 size={22} /> Refer & Earn</h2>
      </div>

      <div className="refer-hero">
        <div className="refer-hero__icon">
          <FiShare2 size={36} />
        </div>
        <h3>Grow Your Network, Build Your Empire</h3>
        <p>Share your unique referral link with friends and family. When they join using your link, they become part of your team.</p>
      </div>

      <div className="refer-code-card">
        <label>Your TPE ID</label>
        <div className="refer-code-display">{user?.tpeId}</div>
      </div>

      <div className="refer-link-card">
        <label>Your Referral Link</label>
        <div className="refer-link-row">
          <input readOnly value={referralLink} onClick={(e) => e.target.select()} />
          <button onClick={copyLink} className="btn-gold btn-gold--compact">
            {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="refer-share-section">
        <h4>Share via</h4>
        <div className="refer-share-buttons">
          <button className="share-btn share-btn--wa" onClick={shareWhatsApp}>
            WhatsApp
          </button>
          <button className="share-btn share-btn--tg" onClick={shareTelegram}>
            Telegram
          </button>
          <button className="share-btn share-btn--email" onClick={shareEmail}>
            Email
          </button>
          <button className="share-btn share-btn--copy" onClick={copyLink}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {stats && (
        <div className="refer-stats">
          <div className="refer-stat-card">
            <FiArrowRight size={20} />
            <span className="refer-stat-card__value">{stats.totalDirects ?? 0}</span>
            <span className="refer-stat-card__label">Direct Referrals</span>
          </div>
          <div className="refer-stat-card">
            <FiUsers size={20} />
            <span className="refer-stat-card__value">{stats.totalTeamSize ?? 0}</span>
            <span className="refer-stat-card__label">Total Team</span>
          </div>
        </div>
      )}
    </div>
  )
}
