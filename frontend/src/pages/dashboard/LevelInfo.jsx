import { useState, useEffect } from 'react'
import { FiLayers, FiUsers, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { getLevelInfo, getLevelMembers } from '../../api/user'

export default function LevelInfo() {
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedLevel, setExpandedLevel] = useState(null)
  const [levelMembers, setLevelMembers] = useState({})
  const [memberLoading, setMemberLoading] = useState(null)

  useEffect(() => {
    getLevelInfo()
      .then((res) => setLevels(res.data.data || []))
      .catch(() => setLevels([]))
      .finally(() => setLoading(false))
  }, [])

  const total = levels.reduce((sum, l) => sum + l.memberCount, 0)
  const maxCount = Math.max(...levels.map((l) => l.memberCount), 1)

  const handleLevelClick = async (level) => {
    if (expandedLevel === level) {
      setExpandedLevel(null)
      return
    }
    setExpandedLevel(level)
    if (levelMembers[level]) return
    setMemberLoading(level)
    try {
      const res = await getLevelMembers(level)
      setLevelMembers((prev) => ({ ...prev, [level]: res.data.data || [] }))
    } catch {
      setLevelMembers((prev) => ({ ...prev, [level]: [] }))
    } finally {
      setMemberLoading(null)
    }
  }

  if (loading) {
    return <div className="dash-page"><div className="dash-loader">Loading...</div></div>
  }

  return (
    <div className="dash-page">
      <div className="page-header">
        <h2 className="page-title"><FiLayers size={22} /> Network Level Info</h2>
      </div>

      <div className="level-total-card">
        <FiUsers size={28} />
        <div>
          <span className="level-total-card__value">{total}</span>
          <span className="level-total-card__label">Total Team Members</span>
        </div>
      </div>

      {levels.length === 0 ? (
        <div className="empty-state">
          <FiLayers size={48} />
          <h3>No team members yet</h3>
          <p>Your level breakdown will appear here as your network grows.</p>
        </div>
      ) : (
        <div className="level-list">
          {levels.map((l) => (
            <div key={l.level}>
              <div
                className={`level-row level-row--clickable ${expandedLevel === l.level ? 'level-row--expanded' : ''}`}
                onClick={() => handleLevelClick(l.level)}
              >
                <div className="level-row__info">
                  <span className="level-row__toggle">
                    {expandedLevel === l.level ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                  </span>
                  <span className={`level-badge level-badge--${l.level <= 3 ? ['', 'green', 'blue', 'purple'][l.level] : 'purple'}`}>
                    Level {l.level}
                  </span>
                  <span className="level-row__count">{l.memberCount} members</span>
                </div>
                <div className="level-row__bar-bg">
                  <div
                    className="level-row__bar-fill"
                    style={{ width: `${(l.memberCount / maxCount) * 100}%` }}
                  />
                </div>
              </div>

              {expandedLevel === l.level && (
                <div className="level-members">
                  {memberLoading === l.level ? (
                    <div className="level-members__loading">Loading members...</div>
                  ) : (levelMembers[l.level] || []).length === 0 ? (
                    <div className="level-members__empty">No members found</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Sr.No</th>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Sponsor ID</th>
                            <th>Sponsor Name</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(levelMembers[l.level] || []).map((m, idx) => (
                            <tr key={m.tpeId}>
                              <td>{idx + 1}</td>
                              <td><code>{m.tpeId}</code></td>
                              <td>{m.fullName}</td>
                              <td><code>{m.sponsorId || '-'}</code></td>
                              <td>{m.sponsorName || '-'}</td>
                              <td>
                                <span className={`status-badge status-badge--${m.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                  {m.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
