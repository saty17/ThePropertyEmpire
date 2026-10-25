import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUsers, FiSearch, FiMoreVertical, FiGitBranch, FiUserPlus, FiLayers, FiCalendar, FiX, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { getAllMembers } from '../../api/user'
import * as XLSX from 'xlsx'

const FILTERS = [
  { key: 'ALL', label: 'All Members' },
  { key: 'MY_NETWORK', label: 'My Network' },
  { key: 'INDEPENDENT', label: 'Independent' },
]

const ACTIONS = [
  { key: 'tree', label: 'View Tree', icon: FiGitBranch, path: '/dashboard/network/generation-tree' },
  { key: 'direct', label: 'View Direct', icon: FiUserPlus, path: '/dashboard/network/my-direct' },
  { key: 'team', label: 'View Team', icon: FiUsers, path: '/dashboard/network/my-team' },
  { key: 'level', label: 'Level Info', icon: FiLayers, path: '/dashboard/network/level-info' },
]

const PAGE_SIZE = 100

function parseDate(dateStr) {
  if (!dateStr || dateStr === '-') return null
  return new Date(dateStr)
}

function toLocalDate(isoStr) {
  if (!isoStr) return null
  const [y, m, d] = isoStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

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

export default function AllMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [joinedFrom, setJoinedFrom] = useState('')
  const [joinedTo, setJoinedTo] = useState('')
  const [activationFrom, setActivationFrom] = useState('')
  const [activationTo, setActivationTo] = useState('')
  const [sponsorSearch, setSponsorSearch] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const isIndependent = activeFilter === 'INDEPENDENT'

  const handleAction = (path, tpeId, fullName) => {
    navigate(path, { state: { rootCode: tpeId, rootName: fullName } })
  }

  const fetchMembers = (filter) => {
    setLoading(true)
    setPage(1)
    getAllMembers(filter)
      .then((res) => setMembers(res.data.data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMembers(activeFilter)
  }, [activeFilter])

  const hasAdvancedFilters = joinedFrom || joinedTo || activationFrom || activationTo || sponsorSearch

  const clearAdvancedFilters = () => {
    setJoinedFrom('')
    setJoinedTo('')
    setActivationFrom('')
    setActivationTo('')
    setSponsorSearch('')
  }

  const filtered = members.filter((m) => {
    if (search) {
      const q = search.toLowerCase()
      if (
        !m.tpeId?.toLowerCase().includes(q) &&
        !m.fullName?.toLowerCase().includes(q) &&
        !m.email?.toLowerCase().includes(q)
      ) return false
    }

    if (joinedFrom || joinedTo) {
      const d = parseDate(m.joinedDate)
      if (!d) return false
      if (joinedFrom && d < toLocalDate(joinedFrom)) return false
      if (joinedTo) {
        const to = toLocalDate(joinedTo)
        to.setHours(23, 59, 59, 999)
        if (d > to) return false
      }
    }

    if (activationFrom || activationTo) {
      const d = parseDate(m.activationDate)
      if (!d) return false
      if (activationFrom && d < toLocalDate(activationFrom)) return false
      if (activationTo) {
        const to = toLocalDate(activationTo)
        to.setHours(23, 59, 59, 999)
        if (d > to) return false
      }
    }

    if (sponsorSearch) {
      const q = sponsorSearch.toLowerCase()
      if (!m.sponsorId?.toLowerCase().includes(q)) return false
    }

    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search, joinedFrom, joinedTo, activationFrom, activationTo, sponsorSearch])

  const exportToExcel = () => {
    const rows = filtered.map((m, idx) => {
      const row = {
        'Sr.No': idx + 1,
        'TPE ID': m.tpeId,
        'Name': m.fullName,
        'Email': m.email,
        'Phone': `${m.countryCode || ''} ${m.mobile || ''}`.trim() || '-',
      }
      if (!isIndependent) {
        row['Sponsor ID'] = m.sponsorId || '-'
        row['Sponsor Name'] = m.sponsorName || '-'
      }
      row['Status'] = m.status === 'ACTIVE' ? 'Active' : 'Inactive'
      row['Joined'] = m.joinedDate || '-'
      row['Activation Date'] = m.activationDate || '-'
      return row
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Members')
    const filterLabel = FILTERS.find((f) => f.key === activeFilter)?.label || 'All'
    XLSX.writeFile(wb, `TPE_${filterLabel.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div className="dash-page">
      <div className="page-header">
        <h2 className="page-title"><FiUsers size={22} /> All Members</h2>
        <button className="btn-outline" onClick={exportToExcel} disabled={loading || filtered.length === 0}>
          <FiDownload size={14} /> Export Excel
        </button>
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

      <div className="date-filters">
        <div className="date-filter-group">
          <label className="date-filter-label"><FiCalendar size={13} /> Joined</label>
          <input type="date" value={joinedFrom} onChange={(e) => setJoinedFrom(e.target.value)} />
          <span className="date-filter-sep">to</span>
          <input type="date" value={joinedTo} onChange={(e) => setJoinedTo(e.target.value)} />
        </div>
        <div className="date-filter-group">
          <label className="date-filter-label"><FiCalendar size={13} /> Activation</label>
          <input type="date" value={activationFrom} onChange={(e) => setActivationFrom(e.target.value)} />
          <span className="date-filter-sep">to</span>
          <input type="date" value={activationTo} onChange={(e) => setActivationTo(e.target.value)} />
        </div>
        {!isIndependent && (
          <div className="date-filter-group">
            <label className="date-filter-label"><FiSearch size={13} /> Sponsor</label>
            <input
              type="text"
              className="sponsor-search-input"
              placeholder="Search by Sponsor ID..."
              value={sponsorSearch}
              onChange={(e) => setSponsorSearch(e.target.value)}
            />
          </div>
        )}
        {hasAdvancedFilters && (
          <button className="btn-outline btn-outline--sm" onClick={clearAdvancedFilters}>
            <FiX size={12} /> Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="dash-loader">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FiUsers size={48} />
          <h3>No members found</h3>
          <p>{search || hasAdvancedFilters ? 'Try adjusting your filters.' : 'No members in this category yet.'}</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>TPE ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  {!isIndependent && <th>Sponsor ID</th>}
                  {!isIndependent && <th>Sponsor Name</th>}
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Activation Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((m, idx) => (
                  <tr key={m.tpeId}>
                    <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td><code>{m.tpeId}</code></td>
                    <td>{m.fullName}</td>
                    <td>{m.email}</td>
                    <td>{m.countryCode} {m.mobile || '-'}</td>
                    {!isIndependent && <td><code>{m.sponsorId || '-'}</code></td>}
                    {!isIndependent && <td>{m.sponsorName || '-'}</td>}
                    <td>
                      <span className={`status-badge status-badge--${m.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        {m.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{m.joinedDate || '-'}</td>
                    <td>{m.activationDate || '-'}</td>
                    <td>
                      <ActionMenu tpeId={m.tpeId} fullName={m.fullName} onAction={handleAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination__btn"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="pagination__info">
                Page {page} of {totalPages} ({filtered.length} total)
              </span>
              <button
                className="pagination__btn"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          )}

          {totalPages <= 1 && (
            <div className="pagination">
              <span className="pagination__info">{filtered.length} entries</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
