import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { useUserProfile, updateProfile, uploadAvatar } from '../hooks/useUserProfile'
import { QRShowModal } from '../components/QRModal'
import { useIsMobile } from '../hooks/useIsMobile'

// ── palette ────────────────────────────────────────────────────────────────
const C = {
  green: '#006D33', greenLight: 'rgba(0,109,51,0.08)',
  text: '#191C1D', sub: '#6B7280', muted: '#3C4A3D',
  border: '#E5E2E1', bg: '#F8F9FA', card: '#FFFFFF',
  red: '#BA1A1A', redLight: 'rgba(186,26,26,0.08)',
}

// ── shared primitives ──────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 11, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0 8px' }}>
        {title}
      </div>
      <div style={{ backgroundColor: C.card, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ icon, label, value, onClick, children, border = true, danger }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '15px 20px',
        borderBottom: border ? `1px solid ${C.border}` : 'none',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.12s',
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.backgroundColor = C.bg)}
      onMouseLeave={e => onClick && (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {icon && (
        <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: danger ? C.redLight : C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: danger ? C.red : C.text }}>{label}</div>
        {value && <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.sub, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>}
      </div>
      {children}
      {onClick && !children && <ChevronIcon />}
    </div>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={e => { e.stopPropagation(); onChange(!on) }} style={{
      width: 44, height: 26, borderRadius: 9999, border: 'none', cursor: 'pointer',
      backgroundColor: on ? C.green : C.border, position: 'relative', padding: 0, flexShrink: 0,
      transition: 'background-color 0.2s',
    }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }}/>
    </button>
  )
}

function ChevronIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke={C.sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button onClick={copy} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: copied ? C.greenLight : 'transparent', fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: copied ? C.green : C.sub, cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

// ── Avatar upload ──────────────────────────────────────────────────────────
function AvatarUpload({ profile, walletAddress, onUpdated }) {
  const fileRef  = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // Always read from profile — no local preview state that gets lost on reload
  const current  = profile?.avatar_url ?? null
  const initials = (profile?.display_name?.[0] ?? profile?.username?.[0] ?? '?').toUpperCase()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const url = await uploadAvatar(walletAddress, file)
      await updateProfile(walletAddress, { avatar_url: url })
      await onUpdated() // refetch profile so the new URL is loaded from DB
    } catch (err) {
      console.error('Avatar upload failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      // reset input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px' }}>
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
        {current
          ? <img src={current} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${C.border}` }}/>
          : <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: 28, color: C.green, border: `3px solid ${C.border}` }}>{initials}</div>
        }
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', backgroundColor: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
          {loading
            ? <div style={{ width: 10, height: 10, border: '1.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
            : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2V8M2 5H8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          }
        </div>
      </div>
      <div>
        <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 15, color: C.text }}>{profile?.display_name || '@' + profile?.username}</div>
        <button onClick={() => fileRef.current?.click()} style={{ marginTop: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: C.green, padding: 0 }}>
          {loading ? 'Uploading...' : 'Change photo'}
        </button>
        {error && <div style={{ fontFamily: 'Inter', fontSize: 11, color: C.red, marginTop: 4 }}>{error}</div>}
      </div>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleFile}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Inline edit field ──────────────────────────────────────────────────────
function EditableField({ label, value, onSave, validate, placeholder }) {
  const [editing, setEditing] = useState(false)
  const [input,   setInput]   = useState(value ?? '')
  const [status,  setStatus]  = useState(null) // 'saving' | 'error' | 'saved'
  const [errMsg,  setErrMsg]  = useState('')

  const handleSave = async () => {
    if (input === value) { setEditing(false); return }
    setStatus('saving')
    try {
      if (validate) {
        const err = await validate(input)
        if (err) { setStatus('error'); setErrMsg(err); return }
      }
      await onSave(input)
      setStatus('saved')
      setTimeout(() => { setStatus(null); setEditing(false) }, 1000)
    } catch (e) {
      setStatus('error')
      setErrMsg(e.message ?? 'Failed to save')
    }
  }

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: C.sub, marginBottom: 2 }}>{label}</div>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>{value || <span style={{ color: C.sub }}>Not set</span>}</div>
        </div>
        <button onClick={() => setEditing(true)} style={{ padding: '5px 14px', borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: 'transparent', fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: C.muted, cursor: 'pointer' }}>Edit</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '15px 20px', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontFamily: 'Inter', fontSize: 11, color: C.sub, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder={placeholder}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${status === 'error' ? C.red : C.green}`, fontFamily: 'Inter', fontSize: 14, color: C.text, outline: 'none', backgroundColor: C.bg }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          autoFocus
        />
        <button onClick={handleSave} disabled={status === 'saving'} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', backgroundColor: C.green, color: '#fff', fontFamily: 'Inter', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {status === 'saving' ? '...' : status === 'saved' ? '✓' : 'Save'}
        </button>
        <button onClick={() => { setEditing(false); setInput(value ?? '') }} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: 'transparent', fontFamily: 'Inter', fontSize: 13, color: C.sub, cursor: 'pointer' }}>✕</button>
      </div>
      {status === 'error' && <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.red, marginTop: 4 }}>{errMsg}</div>}
    </div>
  )
}

// ── QR Modal ───────────────────────────────────────────────────────────────
function QRModal({ address, onClose }) {
  // Simple SVG QR placeholder — in production use a real QR library
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: C.card, borderRadius: 20, padding: 36, width: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 18, color: C.text }}>Receive USDC</div>
        {/* QR code via Google Charts API */}
        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`} alt="QR" style={{ width: 200, height: 200, borderRadius: 12 }}/>
        <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.sub, textAlign: 'center', wordBreak: 'break-all' }}>{address}</div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <CopyButton text={address} />
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${C.border}`, backgroundColor: 'transparent', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: C.muted, cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Settings page ─────────────────────────────────────────────────────
export default function Settings() {
  const { walletAddress, displayName, avatarUrl, logout } = useAuth()
  const { profile, refetch } = useUserProfile(walletAddress)

  const [showQR,      setShowQR]      = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [currency,    setCurrency]    = useState(profile?.currency ?? 'USD')
  const [notifications, setNotifications] = useState(profile?.notifications_enabled ?? false)
  const [autoYield,   setAutoYield]   = useState(profile?.auto_yield ?? true)

  // Sync prefs from profile once loaded
  useEffect(() => {
    if (profile) {
      setCurrency(profile.currency ?? 'USD')
      setNotifications(profile.notifications_enabled ?? false)
      setAutoYield(profile.auto_yield ?? true)
    }
  }, [profile])

  const savePref = async (field, value) => {
    await updateProfile(walletAddress, { [field]: value })
    refetch()
  }

  const validateUsername = async (val) => {
    if (!val || val.length < 3) return 'Min 3 characters'
    if (!/^[a-z0-9_]{3,20}$/.test(val)) return 'Letters, numbers, underscore only'
    if (val === profile?.username) return null
    const taken = await isUsernameTaken(val)
    if (taken) return 'Username already taken'
    return null
  }

  const isMobile = useIsMobile()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg, overflowX: 'hidden' }}>
      {!isMobile && <Sidebar />}

      <div style={{ marginLeft: isMobile ? 0 : 256, flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? 72 : 0, minWidth: 0 }}>

        {isMobile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', backgroundColor: C.bg, position: 'sticky', top: 0, zIndex: 10, borderBottom: `1px solid ${C.border}` }}>
            <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 17, color: C.text }}>Settings</span>
          </div>
        ) : <Header />}

        <main style={{ padding: isMobile ? '16px 16px 24px' : '40px', maxWidth: isMobile ? '100%' : 640, display: 'flex', flexDirection: 'column', gap: isMobile ? 20 : 28 }}>

          {!isMobile && (
            <div>
              <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 26, color: C.text, marginBottom: 4 }}>Settings</h1>
              <p style={{ fontFamily: 'Inter', fontSize: 14, color: C.sub }}>Manage your account, wallet, and preferences</p>
            </div>
          )}

          {/* ── ACCOUNT ── */}
          <Section title="Account">
            <AvatarUpload profile={profile} walletAddress={walletAddress} onUpdated={refetch} />
            <div style={{ padding: '15px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>@</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>Username / Handle</div>
                <div style={{ fontFamily: 'Inter', fontSize: 13, color: C.muted, marginTop: 1 }}>@{profile?.username}</div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, color: C.sub, marginTop: 3 }}>Handles are permanent and cannot be changed.</div>
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: C.bg, border: `1px solid ${C.border}`, fontFamily: 'Inter', fontSize: 11, color: C.sub, flexShrink: 0 }}>Locked</div>
            </div>
            <Row icon="✉️" label="Email" value={displayName?.includes('@') ? displayName : 'Connected via Google'} border={false}/>
          </Section>

          {/* ── WALLET & PAYMENTS ── */}
          <Section title="Wallet & Payments">
            <div style={{ padding: '15px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🔑</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>Wallet Address</div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, color: C.sub, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {walletAddress ?? 'Loading...'}
                </div>
              </div>
              {walletAddress && <CopyButton text={walletAddress} />}
            </div>
            <Row icon="📷" label="Receive via QR" value="Show QR code for your wallet" onClick={() => setShowQR(true)} />
            <div style={{ padding: '15px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🔗</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>Your payment link</div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, color: C.sub, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.username ? `${window.location.origin}/pay/@${profile.username}` : 'Set a username first'}
                </div>
              </div>
              {profile?.username && <CopyButton text={`${window.location.origin}/pay/@${profile.username}`} />}
            </div>
            <div style={{ padding: '15px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>💱</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>Currency Display</div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.sub, marginTop: 1 }}>How amounts are shown in the app</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['USD', 'INR'].map(c => (
                  <button key={c} onClick={() => { setCurrency(c); savePref('currency', c) }} style={{ padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${currency === c ? C.green : C.border}`, backgroundColor: currency === c ? C.greenLight : 'transparent', fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: currency === c ? C.green : C.sub, cursor: 'pointer' }}>{c}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚡</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>Auto-Yield</div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.sub, marginTop: 1 }}>Funds are deployed to Aave v3 automatically</div>
              </div>
              <Toggle on={autoYield} onChange={(v) => { setAutoYield(v); savePref('auto_yield', v) }} />
            </div>
          </Section>

          {/* ── SECURITY ── */}
          <Section title="Security">
            <Row icon="🔒" label="Session" value="Signed in on this device" border />
            <Row icon="🚪" label="Sign out" danger onClick={logout} border={false}/>
          </Section>

          {/* ── NOTIFICATIONS ── */}
          <Section title="Notifications">
            <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🔔</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>Push Notifications</div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.sub, marginTop: 1, lineHeight: 1.5 }}>Payment received · Payment sent · Yield earned</div>
              </div>
              <Toggle on={notifications} onChange={async (v) => {
                if (v) {
                  const perm = await Notification.requestPermission()
                  if (perm !== 'granted') return
                }
                setNotifications(v)
                savePref('notifications_enabled', v)
              }} />
            </div>
          </Section>

          {/* ── HELP ── */}
          <Section title="Help & Support">
            <Row icon="💬" label="Contact Support" value="aryansinhag2006@gmail.com" onClick={() => window.open('mailto:aryansinhag2006@gmail.com')} border={false}/>
          </Section>

          {/* ── ADVANCED ── */}
          <Section title="Advanced">
            <button onClick={() => setShowAdvanced(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚙️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>Advanced Settings</div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.sub, marginTop: 1 }}>Network and developer options</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                <path d="M6 4L10 8L6 12" stroke={C.sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showAdvanced && (
              <div style={{ borderTop: `1px solid ${C.border}`, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 8 }}>Network</div>
                  <select defaultValue="base-sepolia" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontFamily: 'Inter', fontSize: 14, color: C.text, backgroundColor: C.bg, outline: 'none', cursor: 'pointer' }}>
                    <option value="base-sepolia">Base Sepolia (Testnet)</option>
                    <option disabled>Base Mainnet — coming soon</option>
                    <option disabled>Ethereum — coming soon</option>
                    <option disabled>Arbitrum — coming soon</option>
                  </select>
                  <div style={{ fontFamily: 'Inter', fontSize: 11, color: C.sub, marginTop: 6 }}>More networks coming soon. Currently on Base Sepolia testnet.</div>
                </div>
              </div>
            )}
          </Section>

          <div style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 11, color: C.sub, paddingBottom: 20 }}>
            VerdexPay v0.1.0 · Base Sepolia Testnet
          </div>

        </main>
      </div>

      {isMobile && <BottomNav />}

      {showQR && walletAddress && (
        <QRShowModal
          url={profile?.username ? `${window.location.origin}/pay/@${profile.username}` : walletAddress}
          title="Receive payment"
          subtitle={profile?.username ? `@${profile.username}` : walletAddress}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  )
}

            <div style={{ padding: '15px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>@</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>Username / Handle</div>
                <div style={{ fontFamily: 'Inter', fontSize: 13, color: C.muted, marginTop: 1 }}>@{profile?.username}</div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, color: C.sub, marginTop: 3 }}>Handles are permanent and cannot be changed.</div>
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: C.bg, border: `1px solid ${C.border}`, fontFamily: 'Inter', fontSize: 11, color: C.sub }}>Locked</div>
            </div>
            <Row icon="✉️" label="Email" value={displayName?.includes('@') ? displayName : 'Connected via Google'} border={false}/>
          </Section>

          {/* ── WALLET & PAYMENTS ── */}
          <Section title="Wallet & Payments">
            <Row icon="🔑" label="Wallet Address" value={walletAddress ?? 'Loading...'}>
              {walletAddress && <CopyButton text={walletAddress} />}
            </Row>
            <Row icon="📷" label="Receive via QR" value="Show QR code for your wallet" onClick={() => setShowQR(true)} />
            <Row icon="🔗" label="Your payment link" value={profile?.username ? `${window.location.origin}/pay/@${profile.username}` : 'Set a username first'}>
              {profile?.username && <CopyButton text={`${window.location.origin}/pay/@${profile.username}`} />}
            </Row>
            <div style={{ padding: '15px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>💱</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>Currency Display</div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.sub, marginTop: 1 }}>How amounts are shown in the app</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['USD', 'INR'].map(c => (
                  <button key={c} onClick={() => { setCurrency(c); savePref('currency', c) }} style={{
                    padding: '5px 14px', borderRadius: 8,
                    border: `1.5px solid ${currency === c ? C.green : C.border}`,
                    backgroundColor: currency === c ? C.greenLight : 'transparent',
                    fontFamily: 'Inter', fontWeight: 700, fontSize: 12,
                    color: currency === c ? C.green : C.sub, cursor: 'pointer',
                  }}>{c}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚡</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>Auto-Yield</div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.sub, marginTop: 1 }}>Funds are deployed to Aave v3 automatically</div>
              </div>
              <Toggle on={autoYield} onChange={(v) => { setAutoYield(v); savePref('auto_yield', v) }} />
            </div>
          </Section>

          {/* ── SECURITY ── */}
          <Section title="Security">
            <Row icon="🔒" label="Session" value="Signed in on this device" border />
            <Row icon="🚪" label="Sign out" danger onClick={logout} border={false}/>
          </Section>

          {/* ── NOTIFICATIONS ── */}
          <Section title="Notifications">
            <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🔔</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>Push Notifications</div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.sub, marginTop: 1, lineHeight: 1.5 }}>
                  Payment received · Payment sent · Yield earned
                </div>
              </div>
              <Toggle on={notifications} onChange={async (v) => {
                if (v) {
                  // Request browser notification permission
                  const perm = await Notification.requestPermission()
                  if (perm !== 'granted') return // user denied — don't save
                }
                setNotifications(v)
                savePref('notifications_enabled', v)
              }} />
            </div>
          </Section>

          {/* ── HELP ── */}
          <Section title="Help & Support">
            <Row icon="💬" label="Contact Support" value="aryansinhag2006@gmail.com" onClick={() => window.open('mailto:aryansinhag2006@gmail.com')} border={false}/>
          </Section>

          {/* ── ADVANCED ── */}
          <Section title="Advanced">
            <button
              onClick={() => setShowAdvanced(v => !v)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚙️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: C.text }}>Advanced Settings</div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.sub, marginTop: 1 }}>Network and developer options</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                <path d="M6 4L10 8L6 12" stroke={C.sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {showAdvanced && (
              <div style={{ borderTop: `1px solid ${C.border}`, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 8 }}>Network</div>
                  <select
                    defaultValue="base-sepolia"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontFamily: 'Inter', fontSize: 14, color: C.text, backgroundColor: C.bg, outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="base-sepolia">Base Sepolia (Testnet)</option>
                    <option disabled>Base Mainnet — coming soon</option>
                    <option disabled>Ethereum — coming soon</option>
                    <option disabled>Arbitrum — coming soon</option>
                  </select>
                  <div style={{ fontFamily: 'Inter', fontSize: 11, color: C.sub, marginTop: 6 }}>
                    More networks coming soon. Currently on Base Sepolia testnet.
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* version */}
          <div style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 11, color: C.sub, paddingBottom: 20 }}>
            VerdexPay v0.1.0 · Base Sepolia Testnet
          </div>

        </main>
      </div>

      {showQR && walletAddress && (
        <QRShowModal
          url={profile?.username ? `${window.location.origin}/pay/@${profile.username}` : walletAddress}
          title="Receive payment"
          subtitle={profile?.username ? `@${profile.username}` : walletAddress}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  )
}
