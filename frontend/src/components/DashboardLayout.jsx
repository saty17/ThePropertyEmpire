import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  FiHome, FiUser, FiUsers, FiArrowRight, FiGitBranch, FiLayers,
  FiShare2, FiSettings, FiHelpCircle, FiLogOut, FiMenu, FiX,
  FiBell, FiChevronDown, FiDatabase,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import '../styles/dashboard.css'

function getNavItems(role) {
  const items = [
    { label: 'Dashboard', icon: FiHome, to: '/dashboard', end: true },
    { label: 'Profile', icon: FiUser, to: '/dashboard/profile' },
    {
      label: 'Network', icon: FiUsers, children: [
        { label: 'My Direct', icon: FiArrowRight, to: '/dashboard/network/my-direct' },
        { label: 'My Team', icon: FiUsers, to: '/dashboard/network/my-team' },
        { label: 'Generation Tree', icon: FiGitBranch, to: '/dashboard/network/generation-tree' },
        { label: 'Level Info', icon: FiLayers, to: '/dashboard/network/level-info' },
      ],
    },
    { label: 'Refer & Earn', icon: FiShare2, to: '/dashboard/refer' },
  ]

  if (role === 'ADMIN') {
    items.push({ label: 'All Members', icon: FiDatabase, to: '/dashboard/all-members' })
  }

  items.push(
    { label: 'Settings', icon: FiSettings, to: '/dashboard/settings', placeholder: true },
    { label: 'Support', icon: FiHelpCircle, to: '/dashboard/support', placeholder: true },
  )

  return items
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState(null)
  const navItems = getNavItems(user?.role)

  useEffect(() => {
    const networkPaths = ['/dashboard/network']
    if (networkPaths.some((p) => location.pathname.startsWith(p))) {
      setExpandedMenu('Network')
    }
  }, [location.pathname])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const toggleExpand = (label) => {
    setExpandedMenu((prev) => (prev === label ? null : label))
  }

  return (
    <div className="dash-layout">
      {sidebarOpen && <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`dash-sidebar${sidebarOpen ? ' dash-sidebar--open' : ''}`}>
        <div className="dash-sidebar__header">
          <div className="dash-sidebar__avatar">{getInitials(user?.fullName)}</div>
          <div className="dash-sidebar__user-info">
            <span className="dash-sidebar__name">{user?.fullName || 'User'}</span>
            <span className="dash-sidebar__code">{user?.tpeId || ''}</span>
          </div>
          <button className="dash-sidebar__close" onClick={() => setSidebarOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        <nav className="dash-sidebar__nav">
          {navItems.map((item) => {
            if (item.children) {
              const isExpanded = expandedMenu === item.label
              const isChildActive = item.children.some((c) => location.pathname === c.to)
              return (
                <div key={item.label} className="dash-nav-group">
                  <button
                    className={`dash-nav-item dash-nav-item--parent${isChildActive ? ' dash-nav-item--active' : ''}`}
                    onClick={() => toggleExpand(item.label)}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                    <FiChevronDown className={`dash-nav-chevron${isExpanded ? ' dash-nav-chevron--open' : ''}`} />
                  </button>
                  <div className={`dash-nav-children${isExpanded ? ' dash-nav-children--open' : ''}`}>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) => `dash-nav-item dash-nav-item--child${isActive ? ' dash-nav-item--active' : ''}`}
                      >
                        <child.icon size={14} />
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `dash-nav-item${isActive ? ' dash-nav-item--active' : ''}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <button className="dash-sidebar__signout" onClick={logout}>
          <FiLogOut size={18} />
          <span>Sign Out</span>
        </button>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <button className="dash-topbar__menu" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <span className="dash-topbar__welcome">
            Welcome, <strong>{user?.fullName?.split(' ')[0] || 'User'}</strong>
          </span>
          <div className="dash-topbar__actions">
            <button className="dash-topbar__icon-btn"><FiBell size={18} /></button>
            <button className="dash-topbar__icon-btn"><FiSettings size={18} /></button>
            <div className="dash-topbar__avatar">{getInitials(user?.fullName)}</div>
          </div>
        </header>

        <main className="dash-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
