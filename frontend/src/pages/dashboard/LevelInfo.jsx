import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiLayers, FiUsers, FiChevronDown, FiChevronRight, FiArrowLeft, FiMoreVertical, FiGitBranch, FiUserPlus } from 'react-icons/fi'
import { getLevelInfo, getLevelMembers } from '../../api/user'

const ACTIONS = [
  { key: 'tree', label: 'View Tree', icon: FiGitBranch, path: '/dashboard/network/generation-tree' },
  { key: 'direct', label: 'View Direct', icon: FiUserPlus, path: '/dashboard/network/my-direct' },
  { key: 'team', label: 'View Team', icon: FiUsers, path: '/dashboard/network/my-team' },
  { key: 'level', label: 'Level Info', icon: FiLayers, path: '/dashboard/network/level-info' },
]

function ActionMenu({ tpeId, fullName, onAction }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="action-menu" ref={ref}>
      <button className="btn-icon" title="Actions" onClick={() => setOpen(!open)}>
        <FiMoreVertical size={15} />
      </button>
      {open && (
        <div className="action-menu__dropdown">
          {ACTIONS.map((a) => (
            <button
              key={a.key}
              className="action-menu__item"
              onClick={() => { setOpen(false); onAction(a.path, tpeId, fullName) }}
            >
              <a.icon size={14} /> {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LevelInfo() {
  const navigate = useNavigate()
  const location = useLocation()
  const rootCode = location.state?.rootCode || null
  const rootName = location.state?.rootName || null
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedLevel, setExpandedLevel] = useState(null)
  const [levelMembers, setLevelMembers] = useState({})
  const [memberLoading, setMemberLoading] = useState(null)

  useEffect(() => {
    getLevelInfo(rootCode)
      .then((res) => setLevels(res.data.data || []))
      .catch(() => setLevels([]))
      .finally(() => setLoading(false))
  }, [rootCode])

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
      const res = await getLevelMembers(level, rootCode)
      setLevelMembers((prev) => ({ ...prev, [level]: res.data.data || [] }))
    } catch {
      setLevelMembers((prev) => ({ ...prev, [level]: [] }))
    } finally {
      setMemberLoading(null)
    }
  }

  const handleAction = (path, tpeId, fullName) => {
    navigate(path, { state: { rootCode: tpeId, rootName: fullName } })
  }

  if (loading) {
    return <div className="dash-page"><div className="dash-loader">Loading...</div></div>
  }

  return (
    <div className="dash-page">
      <div className="page-header">
        <h2 className="page-title">
          <FiLayers size={22} /> {rootCode ? `Level Info: ${rootName || rootCode}` : 'Network Level Info'}
        </h2>
        {rootCode && (
          <button className="btn-outline" onClick={() => navigate(-1)}>
            <FiArrowLeft size={14} /> Back
          </button>
        )}
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
          <p>{rootCode ? 'This user has no team members.' : 'Your level breakdown will appear here as your network grows.'}</p>
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
                            <th>Action</th>
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
                              <td>
                                <ActionMenu tpeId={m.tpeId} fullName={m.fullName} onAction={handleAction} />
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
