import { useState, useEffect } from 'react'
import { FiUser, FiEdit3, FiSave, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { getProfile, updateProfile } from '../../api/user'
import { COUNTRY_CODES } from '../../data/countryCodes'

export default function Profile() {
  const { updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ fullName: '', mobile: '', countryCode: '+91' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getProfile()
      .then((res) => {
        const p = res.data.data
        setProfile(p)
        setForm({ fullName: p.fullName || '', mobile: p.mobile || '', countryCode: p.countryCode || '+91' })
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      const res = await updateProfile(form)
      const updated = res.data.data
      setProfile(updated)
      updateUser({ fullName: updated.fullName })
      setEditing(false)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({ fullName: profile?.fullName || '', mobile: profile?.mobile || '', countryCode: profile?.countryCode || '+91' })
    setEditing(false)
  }

  if (loading) {
    return <div className="dash-page"><div className="dash-loader">Loading...</div></div>
  }

  return (
    <div className="dash-page">
      <div className="page-header">
        <h2 className="page-title"><FiUser size={22} /> My Profile</h2>
        {!editing && (
          <button className="btn-outline" onClick={() => setEditing(true)}>
            <FiEdit3 size={14} /> Edit Profile
          </button>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {profile?.fullName?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
        </div>

        <div className="profile-fields">
          <div className="profile-field">
            <label>Full Name</label>
            {editing ? (
              <input name="fullName" value={form.fullName} onChange={handleChange} className="profile-input" />
            ) : (
              <span className="profile-value">{profile?.fullName}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Email</label>
            <span className="profile-value profile-value--disabled">{profile?.email}</span>
          </div>

          <div className="profile-field">
            <label>Mobile</label>
            {editing ? (
              <div className="phone-input-row">
                <select name="countryCode" value={form.countryCode} onChange={handleChange} className="country-code-select">
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  inputMode="numeric"
                  name="mobile"
                  value={form.mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setForm({ ...form, mobile: val })
                  }}
                  className="profile-input"
                  placeholder="Mobile number"
                />
              </div>
            ) : (
              <span className="profile-value">{profile?.countryCode} {profile?.mobile || '-'}</span>
            )}
          </div>

          <div className="profile-field">
            <label>TPE ID</label>
            <span className="profile-value profile-value--disabled"><code>{profile?.tpeId}</code></span>
          </div>

          <div className="profile-field">
            <label>Role</label>
            <span className="profile-value profile-value--disabled">{profile?.role}</span>
          </div>

          <div className="profile-field">
            <label>Joined</label>
            <span className="profile-value profile-value--disabled">
              {profile?.createdAt || '-'}
            </span>
          </div>
        </div>

        {editing && (
          <div className="profile-actions">
            <button className="btn-gold" onClick={handleSave} disabled={saving}>
              <FiSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="btn-outline" onClick={handleCancel}>
              <FiX size={16} /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
