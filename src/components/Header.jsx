import React from 'react'

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
    <circle cx="6" cy="6" r="4.5" stroke="#6B7280" strokeWidth="1.5"/>
    <path d="M9.5 9.5L12.5 12.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const BellIcon = () => (
  <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
    <path d="M8 0C8 0 3 3 3 9V14L1 16V17H15V16L13 14V9C13 3 8 0 8 0Z" stroke="#191C1D" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M6 17C6 18.1046 6.89543 19 8 19C9.10457 19 10 18.1046 10 17" stroke="#191C1D" strokeWidth="1.5"/>
    <circle cx="12" cy="4" r="3" fill="#BA1A1A"/>
  </svg>
)

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="#191C1D" strokeWidth="1.5"/>
    <circle cx="10" cy="8" r="3" stroke="#191C1D" strokeWidth="1.5"/>
    <path d="M3.5 16.5C4.5 13.5 7 12 10 12C13 12 15.5 13.5 16.5 16.5" stroke="#191C1D" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export default function Header() {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 32px',
      height: 64,
      backgroundColor: '#F8F9FA',
    }}>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
        <SearchIcon />
        <input
          type="text"
          placeholder="Search transactions or assets"
          style={{
            width: '100%',
            padding: '8px 16px 9px 40px',
            backgroundColor: '#F3F4F5',
            border: 'none',
            borderRadius: 8,
            fontFamily: 'Manrope',
            fontWeight: 400,
            fontSize: 14,
            color: '#6B7280',
            outline: 'none',
          }}
        />
      </div>

      {/* Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <BellIcon />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <UserIcon />
        </button>
      </div>
    </header>
  )
}
