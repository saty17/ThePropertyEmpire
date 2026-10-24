import { useState, useEffect } from 'react'
import { FiUsers, FiSearch } from 'react-icons/fi'
import { getAllMembers } from '../../api/user'

const FILTERS = [
  { key: 'ALL', label: 'All Members' },
  { key: 'MY_NETWORK', label: 'My Network' },
  { key: 'INDEPENDENT', label: 'Independent' },
]

export default function AllMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const fetchMembers = (filter) => {
    setLoading(true)
    getAllMembers(filter)
      .then((res) => setMembers(res.data.data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMembers(activeFilter)
  }, [activeFilter])

  const filtered = members.filter((m) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.tpeId?.toLowerCase().includes(q) ||
      m.fullName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="dash-page">
      <div className="page-header">
        <h2 className="page-title"><FiUsers size={22} /> All Members</h2>
      </div>

      <div className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-tab ${activeFilter === f.key ? 'filter-tab--active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
            {activeFilter === f.key && !loading && (
              <span className="filter-tab__count">{members.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <FiSearch size={16} />
        <input
          type="text"
          placeholder="Search by TPE ID, name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="dash-loader">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FiUsers size={48} />
          <h3>No members found</h3>
          <p>{search ? 'Try a different search term.' : 'No members in this category yet.'}</p>
        </div>
      ) : (
        <>
          <div className="table-responsive hide-mobile">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>TPE ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Sponsor ID</th>
                  <th>Sponsor Name</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Activation Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, idx) => (
                  <tr key={m.tpeId}>
                    <td>{idx + 1}</td>
                    <td><code>{m.tpeId}</code></td>
                    <td>{m.fullName}</td>
                    <td>{m.email}</td>
                    <td>{m.countryCode} {m.mobile || '-'}</td>
                    <td><code>{m.sponsorId || '-'}</code></td>
                    <td>{m.sponsorName || '-'}</td>
                    <td>
                      <span className={`status-badge status-badge--${m.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        {m.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{m.joinedDate || '-'}</td>
                    <td>{m.activationDate || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="member-cards show-mobile">
            {filtered.map((m, idx) => (
              <div key={m.tpeId} className="member-card">
                <div className="member-card__header">
                  <span className="member-card__rank">#{idx + 1}</span>
                  <span className={`status-badge status-badge--${m.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                    {m.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="member-card__name">{m.fullName}</div>
                <div className="member-card__details">
                  <span><strong>TPE ID:</strong> {m.tpeId}</span>
                  <span><strong>Email:</strong> {m.email}</span>
                  <span><strong>Phone:</strong> {m.countryCode} {m.mobile || '-'}</span>
                  <span><strong>Sponsor:</strong> {m.sponsorId || '-'} ({m.sponsorName || '-'})</span>
                  <span><strong>Joined:</strong> {m.joinedDate || '-'}</span>
                  <span><strong>Activation:</strong> {m.activationDate || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
