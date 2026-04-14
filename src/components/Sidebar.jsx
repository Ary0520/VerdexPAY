import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUserProfile } from '../hooks/useUserProfile'

const DashboardIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="6.5" height="6.5" rx="1.5" fill={active ? '#006D33' : '#3C4A3D'}/>
    <rect x="10.5" y="1" width="6.5" height="6.5" rx="1.5" fill={active ? '#006D33' : '#3C4A3D'}/>
    <rect x="1" y="10.5" width="6.5" height="6.5" rx="1.5" fill={active ? '#006D33' : '#3C4A3D'}/>
    <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5" fill={active ? '#006D33' : '#3C4A3D'}/>
  </svg>
)

const SendIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 9H16M10 3L16 9L10 15" stroke={active ? '#006D33' : '#3C4A3D'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const DeFiIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 2L16 6V12L9 16L2 12V6L9 2Z" stroke={active ? '#006D33' : '#3C4A3D'} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9 2V16M2 6L16 12M16 6L2 12" stroke={active ? '#006D33' : '#3C4A3D'} strokeWidth="1.5"/>
  </svg>
)

const SettingsIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="3" stroke={active ? '#006D33' : '#3C4A3D'} strokeWidth="1.5"/>
    <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.22 3.22l1.42 1.42M15.36 15.36l1.42 1.42M3.22 16.78l1.42-1.42M15.36 4.64l1.42-1.42" stroke={active ? '#006D33' : '#3C4A3D'} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const TxIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 5H15M3 9H15M3 13H10" stroke={active ? '#006D33' : '#3C4A3D'} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M13 11L15 13L13 15" stroke={active ? '#006D33' : '#3C4A3D'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const navItems = [
  { label: 'Dashboard',    path: '/dashboard',     Icon: DashboardIcon },
  { label: 'Send & Request', path: '/send',         Icon: SendIcon },
  { label: 'DeFi Yield',   path: '/defi',           Icon: DeFiIcon },
  { label: 'Transactions', path: '/transactions',   Icon: TxIcon },
  { label: 'Settings',     path: '/settings',       Icon: SettingsIcon },
]

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 2H2.5C1.95 2 1.5 2.45 1.5 3V11C1.5 11.55 1.95 12 2.5 12H5" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M9.5 4.5L12.5 7L9.5 9.5M12.5 7H5" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Sidebar() {
  const { displayName, shortAddress, avatarUrl, logout, walletAddress } = useAuth()
  const { profile } = useUserProfile(walletAddress)
  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: 256,
      height: '100vh',
      backgroundColor: '#F3F4F5',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '32px 0',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 32px 40px' }}>
        <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: '#006D33' }}>VerdexPay</div>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3C4A3D', opacity: 0.6, marginTop: 2 }}>
          INSTITUTIONAL GRADE
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {navItems.map(({ label, path, Icon }) => (
          <NavLink
            key={label}
            to={path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 32px',
              width: 256,
              marginLeft: isActive ? 4 : 0,
              backgroundColor: isActive ? '#FFFFFF' : 'transparent',
              borderRadius: isActive ? '0px 9999px 9999px 0px' : 0,
              boxShadow: isActive ? '0px 1px 2px 0px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
              textDecoration: 'none',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span style={{
                  fontFamily: 'Manrope',
                  fontWeight: 500,
                  fontSize: 14,
                  color: isActive ? '#006D33' : '#3C4A3D',
                }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div style={{ padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12 }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(0,109,51,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, color: '#006D33', flexShrink: 0 }}>
              {(displayName?.[0] ?? '?').toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: '#191C1D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
            {profile?.username
              ? <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 10, color: '#006D33', marginTop: 1 }}>@{profile.username}</span>
              : shortAddress && <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 10, color: '#006D33', marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{shortAddress}</span>
            }
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', flexShrink: 0, opacity: 0.7 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  )
}
