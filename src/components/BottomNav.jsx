import React from 'react'
import { NavLink } from 'react-router-dom'

const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M3 9.5L11 3L19 9.5V19C19 19.55 18.55 20 18 20H14V15H8V20H4C3.45 20 3 19.55 3 19V9.5Z"
      stroke={active ? '#006D33' : '#6B7280'} strokeWidth="1.6" strokeLinejoin="round"
      fill={active ? 'rgba(0,109,51,0.1)' : 'none'}/>
  </svg>
)

const PayIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="8" stroke={active ? '#006D33' : '#6B7280'} strokeWidth="1.6"
      fill={active ? 'rgba(0,109,51,0.1)' : 'none'}/>
    <path d="M7 11H15M11 7L15 11L11 15" stroke={active ? '#006D33' : '#6B7280'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const EarnIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M3 17L8 12L12 15L19 7" stroke={active ? '#006D33' : '#6B7280'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 7H19V11" stroke={active ? '#006D33' : '#6B7280'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const HistoryIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="3" y="3" width="16" height="16" rx="3" stroke={active ? '#006D33' : '#6B7280'} strokeWidth="1.6"
      fill={active ? 'rgba(0,109,51,0.1)' : 'none'}/>
    <path d="M7 8H15M7 11H15M7 14H11" stroke={active ? '#006D33' : '#6B7280'} strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

const MeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="8" r="3.5" stroke={active ? '#006D33' : '#6B7280'} strokeWidth="1.6"
      fill={active ? 'rgba(0,109,51,0.1)' : 'none'}/>
    <path d="M4 19C4 15.69 7.13 13 11 13C14.87 13 18 15.69 18 19" stroke={active ? '#006D33' : '#6B7280'} strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

const tabs = [
  { label: 'Home',    path: '/dashboard',    Icon: HomeIcon },
  { label: 'Pay',     path: '/send',         Icon: PayIcon },
  { label: 'Earn',    path: '/defi',         Icon: EarnIcon },
  { label: 'History', path: '/transactions', Icon: HistoryIcon },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E5E2E1',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    }}>
      {tabs.map(({ label, path, Icon }) => (
        <NavLink
          key={label}
          to={path}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '10px 0 8px',
            textDecoration: 'none',
            position: 'relative',
          })}
        >
          {({ isActive }) => (
            <>
              {/* Active indicator dot */}
              {isActive && (
                <div style={{ position: 'absolute', top: 6, width: 4, height: 4, borderRadius: '50%', backgroundColor: '#006D33' }}/>
              )}
              <Icon active={isActive} />
              <span style={{
                fontFamily: 'Inter',
                fontWeight: isActive ? 700 : 500,
                fontSize: 10,
                color: isActive ? '#006D33' : '#6B7280',
                letterSpacing: '0.01em',
              }}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
