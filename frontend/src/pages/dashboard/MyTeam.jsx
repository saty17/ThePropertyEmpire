import { useState, useEffect } from 'react'
import { FiUsers, FiShare2, FiArrowLeft } from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'
import { getMyTeam } from '../../api/user'

const LEVEL_COLORS = { 1: 'green', 2: 'blue', 3: 'purple' }

function levelCls(level) {
  return LEVEL_COLORS[level] || 'purple'
}

export default function MyTeam() {
  const navigate = useNavigate()
  const location = useLocation()
  const rootCode = location.state?.rootCode || null
  const rootName = location.state?.rootName || null
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyTeam(rootCode)
      .then((res) => setTeam(res.data.data || []))
      .catch(() => setTeam([]))
      .finally(() => setLoading(false))
  }, [rootCode])

  const l1 = team.filter((m) => m.level === 1).length
  const l2 = team.filter((m) => m.level === 2).length
  const l3plus = team.filter((m) => m.level >= 3).length

  if (loading) {
    return <div className="dash-page"><div className="dash-loader">Loading...</div></div>
  }

  return (
    <div className="dash-page">
      <div className="page-header">
        <h2 className="page-title">
          <FiUsers size={22} /> {rootCode ? `Team: ${rootName || rootCode}` : 'My Team'}
        </h2>
        <div className="page-header__right">
          <span className="page-badge">{team.length} members</span>
          {rootCode && (
            <button className="btn-outline" onClick={() => navigate(-1)}>
              <FiArrowLeft size={14} /> Back
            </button>
          )}
        </div>
      </div>

      {team.length > 0 && (
        <div className="summary-bar">
          <div className="summary-item">
            <span className="summary-item__value">{team.length}</span>
            <span className="summary-item__label">Total</span>
          </div>
          <div className="summary-item summary-item--green">
            <span className="summary-item__value">{l1}</span>
            <span className="summary-item__label">Level 1</span>
          </div>
          <div className="summary-item summary-item--blue">
            <span className="summary-item__value">{l2}</span>
            <span className="summary-item__label">Level 2</span>
          </div>
          <div className="summary-item summary-item--purple">
            <span className="summary-item__value">{l3plus}</span>
            <span className="summary-item__label">Level 3+</span>
          </div>
        </div>
      )}

      {team.length === 0 ? (
        <div className="empty-state">
          <FiUsers size={48} />
          <h3>No team members yet</h3>
          <p>{rootCode ? 'This user has no team members.' : 'Share your referral link to start building your team!'}</p>
          {!rootCode && (
            <button className="btn-gold" onClick={() => navigate('/dashboard/refer')}>
              <FiShare2 size={16} /> Share Referral Link
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Level</th>
                  <th>TPE ID</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {team.map((m, i) => (
                  <tr key={m.tpeId}>
                    <td>{i + 1}</td>
                    <td className="td-name">{m.fullName}</td>
                    <td>{m.email}</td>
                    <td><span className={`level-badge level-badge--${levelCls(m.level)}`}>L{m.level}</span></td>
                    <td><code className="code-badge">{m.tpeId}</code></td>
                    <td>{m.joinedDate ? new Date(m.joinedDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={`status-badge status-badge--${m.status === 'Active' || m.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        {m.status === 'Active' || m.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-list mobile-only">
            {team.map((m) => (
              <div key={m.tpeId} className="member-card">
                <div className="member-card__header">
                  <div className="member-card__avatar">{m.fullName?.charAt(0)}</div>
                  <div>
                    <strong>{m.fullName}</strong>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className={`level-badge level-badge--${levelCls(m.level)}`}>L{m.level}</span>
                      <code className="code-badge">{m.tpeId}</code>
                    </div>
                  </div>
                  <span className={`status-badge status-badge--${m.status === 'Active' || m.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                    {m.status === 'Active' || m.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="member-card__details">
                  <span>{m.email}</span>
                  <span>{m.joinedDate ? new Date(m.joinedDate).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
