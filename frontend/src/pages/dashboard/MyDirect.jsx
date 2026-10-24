import { useState, useEffect } from 'react'
import { FiUsers, FiShare2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { getMyDirects } from '../../api/user'

export default function MyDirect() {
  const navigate = useNavigate()
  const [directs, setDirects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyDirects()
      .then((res) => setDirects(res.data.data || []))
      .catch(() => setDirects([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="dash-page"><div className="dash-loader">Loading...</div></div>
  }

  return (
    <div className="dash-page">
      <div className="page-header">
        <h2 className="page-title"><FiUsers size={22} /> My Direct Referrals</h2>
        <span className="page-badge">{directs.length} members</span>
      </div>

      {directs.length === 0 ? (
        <div className="empty-state">
          <FiUsers size={48} />
          <h3>No direct referrals yet</h3>
          <p>Share your referral link to grow your network!</p>
          <button className="btn-gold" onClick={() => navigate('/dashboard/refer')}>
            <FiShare2 size={16} /> Share Referral Link
          </button>
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
                  <th>Mobile</th>
                  <th>TPE ID</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {directs.map((d, i) => (
                  <tr key={d.tpeId}>
                    <td>{i + 1}</td>
                    <td className="td-name">{d.fullName}</td>
                    <td>{d.email}</td>
                    <td>{d.countryCode && d.mobile ? `${d.countryCode} ${d.mobile}` : d.mobile || '-'}</td>
                    <td><code className="code-badge">{d.tpeId}</code></td>
                    <td>{d.joinedDate ? new Date(d.joinedDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={`status-badge status-badge--${d.status === 'Active' ? 'active' : 'inactive'}`}>
                        {d.status === 'Active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-list mobile-only">
            {directs.map((d, i) => (
              <div key={d.tpeId} className="member-card">
                <div className="member-card__header">
                  <div className="member-card__avatar">{d.fullName?.charAt(0)}</div>
                  <div>
                    <strong>{d.fullName}</strong>
                    <code className="code-badge">{d.tpeId}</code>
                  </div>
                  <span className={`status-badge status-badge--${d.status === 'Active' ? 'active' : 'inactive'}`}>
                    {d.status === 'Active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="member-card__details">
                  <span>{d.email}</span>
                  <span>{d.countryCode && d.mobile ? `${d.countryCode} ${d.mobile}` : d.mobile || '-'}</span>
                  <span>{d.joinedDate ? new Date(d.joinedDate).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
