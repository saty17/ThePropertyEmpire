import { useState, useEffect } from 'react'
import { FiLayers, FiUsers } from 'react-icons/fi'
import { getLevelInfo } from '../../api/user'

export default function LevelInfo() {
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLevelInfo()
      .then((res) => setLevels(res.data.data || []))
      .catch(() => setLevels([]))
      .finally(() => setLoading(false))
  }, [])

  const total = levels.reduce((sum, l) => sum + l.memberCount, 0)
  const maxCount = Math.max(...levels.map((l) => l.memberCount), 1)

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
            <div key={l.level} className="level-row">
              <div className="level-row__info">
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
          ))}
        </div>
      )}
    </div>
  )
}
