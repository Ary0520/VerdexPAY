import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { resolveHandle } from '../hooks/useUserProfile'
import { useAuth } from '../context/AuthContext'
import { useUserProfile } from '../hooks/useUserProfile'
import { createPaymentRequest } from '../hooks/usePaymentRequests'

// ── theme ──────────────────────────────────────────────────────────────────
const T = {
  primary:   '#C45C00',
  grad:      'linear-gradient(174deg, #C45C00 0%, #FFA478 100%)',
  gradLight: 'rgba(196,92,0,0.08)',
  gradBadge: 'rgba(255,164,120,0.18)',
  text:      '#191C1D',
  sub:       '#6B7280',
  muted:     '#3C4A3D',
  border:    '#E5E2E1',
  bg:        '#F8F9FA',
  card:      '#FFFFFF',
  pill:      '#FFF4EE',
}

// ── icons ──────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="#6B7280" strokeWidth="1.5"/>
    <path d="M11 11L14 14" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M12 4L6 10L12 16" stroke="#191C1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const BellIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1C7 1 3.5 3 3.5 6.5V10L2 11.5V12H12V11.5L10.5 10V6.5C10.5 3 7 1 7 1Z" stroke={T.primary} strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M5.5 12C5.5 12.83 6.17 13.5 7 13.5C7.83 13.5 8.5 12.83 8.5 12" stroke={T.primary} strokeWidth="1.2"/>
  </svg>
)
const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 8C6 9.1 6.9 10 8 10H11C12.1 10 13 9.1 13 8C13 6.9 12.1 6 11 6H10" stroke={T.primary} strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M10 8C10 6.9 9.1 6 8 6H5C3.9 6 3 6.9 3 8C3 9.1 3.9 10 5 10H6" stroke={T.primary} strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M8 20L16 28L32 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="13" cy="3" r="2" stroke={T.primary} strokeWidth="1.3"/>
    <circle cx="3" cy="8" r="2" stroke={T.primary} strokeWidth="1.3"/>
    <circle cx="13" cy="13" r="2" stroke={T.primary} strokeWidth="1.3"/>
    <path d="M5 7L11 4M5 9L11 12" stroke={T.primary} strokeWidth="1.3"/>
  </svg>
)

// ── data ───────────────────────────────────────────────────────────────────
// No mock contacts — live Supabase search only

const PRESETS = [10, 25, 50, 100]
const EMOJIS  = ['☕', '🍕', '🎉', '🙏', '❤️', '🍺', '🎁', '✈️']

// ── helpers ────────────────────────────────────────────────────────────────
function Avatar({ contact, size = 48 }) {
  if (contact.avatar)
    return <img src={contact.avatar} alt={contact.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: contact.color || T.primary,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Manrope', fontWeight: 800, fontSize: size * 0.3,
      color: '#fff', flexShrink: 0,
    }}>{contact.initials}</div>
  )
}

function Pill({ children, onClick, active }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 18px', borderRadius: 9999,
      border: active ? `2px solid ${T.primary}` : `1.5px solid ${T.border}`,
      backgroundColor: active ? T.gradLight : '#fff',
      fontFamily: 'Manrope', fontWeight: 700, fontSize: 14,
      color: active ? T.primary : T.muted,
      cursor: 'pointer', transition: 'all 0.15s',
    }}>{children}</button>
  )
}

// ── Confetti (orange palette) ──────────────────────────────────────────────
function Confetti() {
  const colors = ['#C45C00','#FFA478','#FFD700','#FF6B6B','#FFF4EE','#E8650A']
  const pieces = Array.from({ length: 32 }, (_, i) => ({
    id: i, color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.6}s`,
    size: 6 + Math.random() * 6,
    rotate: Math.random() * 360,
  }))
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{`@keyframes confettiFall2{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(340px) rotate(720deg);opacity:0}}`}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: 0, left: p.left,
          width: p.size, height: p.size, backgroundColor: p.color, borderRadius: 2,
          animation: `confettiFall2 1.4s ease-in ${p.delay} forwards`,
          transform: `rotate(${p.rotate}deg)`,
        }} />
      ))}
    </div>
  )
}

// ── Progress bar ───────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  const steps = ['Recipient', 'Amount', 'Review', 'Done']
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              backgroundColor: i <= step ? T.primary : T.border,
              border: i === step ? `3px solid rgba(196,92,0,0.2)` : '3px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}>
              {i < step
                ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 11, color: i === step ? '#fff' : '#9CA3AF' }}>{i + 1}</span>
              }
            </div>
            <span style={{ fontFamily: 'Inter', fontSize: 10, color: i <= step ? T.primary : '#9CA3AF', fontWeight: i === step ? 700 : 400 }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, backgroundColor: i < step ? T.primary : T.border, marginBottom: 16, transition: 'background-color 0.3s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Step 1: Recipient ──────────────────────────────────────────────────────
function StepRecipient({ onNext }) {
  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState([])
  const [selected,  setSelected]  = useState(null)
  const [searching, setSearching] = useState(false)
  const [debounce,  setDebounce]  = useState(null)
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  const isRawAddress = /^0x[0-9a-fA-F]{40}$/.test(query.trim())

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setSelected(null)
    if (debounce) clearTimeout(debounce)
    if (!val.trim() || val.length < 2 || isRawAddress) { setResults([]); return }
    setSearching(true)
    setDebounce(setTimeout(async () => {
      const result = await resolveHandle(val.trim())
      setResults(result ? [result] : [])
      setSearching(false)
    }, 400))
  }

  const handleSelect = (r) => { setSelected(r); setQuery('@' + r.username); setResults([]) }

  const rawContact = isRawAddress
    ? { username: query.trim().slice(0,6)+'...'+query.trim().slice(-4), display_name: 'Direct address', wallet_address: query.trim() }
    : null

  const canContinue = selected || isRawAddress
  const handleContinue = () => {
    if (isRawAddress && !selected) {
      onNext({ name: rawContact.username, handle: rawContact.wallet_address, address: rawContact.wallet_address, initials: '?', color: '#6B7280' })
      return
    }
    if (selected) {
      onNext({ name: selected.display_name || '@' + selected.username, handle: '@' + selected.username, address: selected.wallet_address, initials: (selected.display_name?.[0] || selected.username[0]).toUpperCase(), color: T.primary, avatar: selected.avatar_url })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 28, color: T.text, marginBottom: 6 }}>Request money</h1>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: T.sub }}>They'll get a push notification instantly</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <SearchIcon />
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          placeholder="@username or 0x address"
          style={{
            width: '100%', padding: '16px 16px 16px 48px',
            backgroundColor: '#F3F4F5', border: '2px solid transparent',
            borderRadius: 14, fontFamily: 'Inter', fontSize: 15, color: T.text,
            outline: 'none', transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = T.primary}
          onBlur={e => e.target.style.borderColor = 'transparent'}
        />
      </div>

      {/* Results */}
      {(results.length > 0 || searching || isRawAddress) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {searching && <div style={{ padding: '12px 16px', fontFamily: 'Inter', fontSize: 13, color: T.sub }}>Searching...</div>}
          {results.map(r => (
            <button key={r.wallet_address} onClick={() => handleSelect(r)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 16px', borderRadius: 12,
              backgroundColor: selected?.wallet_address === r.wallet_address ? T.gradLight : '#F3F4F5',
              border: selected?.wallet_address === r.wallet_address ? `1.5px solid rgba(196,92,0,0.2)` : '1.5px solid transparent',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
            }}>
              {r.avatar_url
                ? <img src={r.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}/>
                : <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, color: '#fff', flexShrink: 0 }}>
                    {(r.display_name?.[0] || r.username[0]).toUpperCase()}
                  </div>
              }
              <div>
                <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: T.text }}>{r.display_name || r.username}</div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: T.sub }}>@{r.username}</div>
              </div>
              {selected?.wallet_address === r.wallet_address && (
                <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', backgroundColor: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </button>
          ))}
          {isRawAddress && (
            <div style={{ padding: '10px 16px', backgroundColor: T.gradLight, borderRadius: 10 }}>
              <span style={{ fontFamily: 'Inter', fontSize: 12, color: T.primary }}>✓ Valid address</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={!canContinue}
        style={{
          padding: '16px', borderRadius: 14, border: 'none',
          background: canContinue ? T.grad : T.border,
          color: canContinue ? '#fff' : '#9CA3AF',
          fontFamily: 'Manrope', fontWeight: 800, fontSize: 16,
          cursor: canContinue ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          boxShadow: canContinue ? '0 4px 16px rgba(196,92,0,0.28)' : 'none',
        }}
      >
        Continue →
      </button>
    </div>
  )
}

// ── Step 2: Amount ─────────────────────────────────────────────────────────
function StepAmount({ recipient, onNext, onBack }) {
  const [amount, setAmount]       = useState('')
  const [note, setNote]           = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  const handleAmountKey = (e) => {
    const allowed = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','ArrowLeft','ArrowRight','Tab']
    if (!allowed.includes(e.key)) e.preventDefault()
    if (e.key === '.' && amount.includes('.')) e.preventDefault()
  }

  const numVal = parseFloat(amount) || 0
  const valid  = numVal > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Back + recipient */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex' }}>
          <BackIcon />
        </button>
        <Avatar contact={recipient} size={36} />
        <div>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: T.text }}>{recipient.name}</div>
          <div style={{ fontFamily: 'Inter', fontSize: 12, color: T.sub }}>{recipient.handle}</div>
        </div>
      </div>

      {/* Big amount */}
      <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 52, color: amount ? T.primary : '#D1D5DB', lineHeight: 1 }}>$</span>
          <input
            ref={inputRef}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={handleAmountKey}
            placeholder="0"
            inputMode="decimal"
            style={{
              fontFamily: 'Manrope', fontWeight: 800, fontSize: 52, lineHeight: 1,
              color: T.primary, background: 'none', border: 'none', outline: 'none',
              width: Math.max(60, (amount.length || 1) * 32), textAlign: 'left',
            }}
          />
          <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, color: T.sub, alignSelf: 'flex-end', paddingBottom: 8 }}>USDC</span>
        </div>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>
          They'll receive a notification to pay
        </p>
      </div>

      {/* Presets */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {PRESETS.map(p => (
          <Pill key={p} active={amount === String(p)} onClick={() => setAmount(String(p))}>${p}</Pill>
        ))}
      </div>

      {/* Note */}
      <div style={{ position: 'relative' }}>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="What's it for? (optional)"
          maxLength={80}
          style={{
            width: '100%', padding: '14px 48px 14px 16px',
            backgroundColor: '#F3F4F5', border: '2px solid transparent',
            borderRadius: 12, fontFamily: 'Inter', fontSize: 14, color: T.text,
            outline: 'none', transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = T.primary}
          onBlur={e => e.target.style.borderColor = 'transparent'}
        />
        <button
          onClick={() => setShowEmojis(v => !v)}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}
        >😊</button>
        {showEmojis && (
          <div style={{
            position: 'absolute', right: 0, top: '110%', zIndex: 10,
            backgroundColor: '#fff', borderRadius: 12, padding: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            display: 'flex', gap: 8, flexWrap: 'wrap', width: 200,
          }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => { setNote(n => n + e); setShowEmojis(false) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 4, borderRadius: 6 }}>
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => valid && onNext({ amount, note })}
        disabled={!valid}
        style={{
          padding: '16px', borderRadius: 14, border: 'none',
          background: valid ? T.grad : T.border,
          color: valid ? '#fff' : '#9CA3AF',
          fontFamily: 'Manrope', fontWeight: 800, fontSize: 16,
          cursor: valid ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          boxShadow: valid ? '0 4px 16px rgba(196,92,0,0.28)' : 'none',
        }}
      >
        Review →
      </button>
    </div>
  )
}

// ── Step 3: Review ─────────────────────────────────────────────────────────
function StepReview({ recipient, amount, note, onConfirm, onBack, requesterAddress, requesterUsername }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      await createPaymentRequest({
        requesterAddress,
        requesterUsername,
        payerAddress:   recipient.address,
        payerUsername:  recipient.handle?.replace('@', '') || null,
        amount,
        note,
      })
      onConfirm()
    } catch (e) {
      setError(e.message ?? 'Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex' }}>
          <BackIcon />
        </button>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, color: T.text }}>Review request</h2>
      </div>

      {/* Receipt card */}
      <div style={{
        backgroundColor: T.bg, borderRadius: 16, padding: 28,
        border: `1.5px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        {/* Recipient */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Avatar contact={recipient} size={64} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, color: T.text }}>{recipient.name}</div>
            <div style={{ fontFamily: 'Inter', fontSize: 13, color: T.sub }}>{recipient.handle}</div>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: T.border }} />

        {/* Amount */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Inter', fontSize: 13, color: T.sub, marginBottom: 4 }}>You're requesting</div>
          <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 40, color: T.primary, lineHeight: 1 }}>
            ${parseFloat(amount).toFixed(2)}
          </div>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: T.sub, marginTop: 4 }}>USDC</div>
        </div>

        {note && (
          <div style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 14, color: T.muted, backgroundColor: '#fff', borderRadius: 10, padding: '10px 16px' }}>
            "{note}"
          </div>
        )}

        <div style={{ height: 1, backgroundColor: T.border }} />

        {/* What happens next */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 11, color: T.sub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>What happens next</p>
          {[
            { icon: <BellIcon />, label: `${recipient.name} gets a push notification` },
            { icon: <LinkIcon />, label: 'They can pay with one tap' },
            { icon: <CheckIcon2 />, label: 'You get notified when paid' },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: T.gradLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
              </div>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: T.muted }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(186,26,26,0.08)', borderRadius: 10, border: '1px solid rgba(186,26,26,0.2)' }}>
          <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#BA1A1A' }}>⚠ {error}</span>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={loading}
        style={{
          padding: '18px', borderRadius: 14, border: 'none',
          background: loading ? T.border : T.grad,
          color: loading ? '#9CA3AF' : '#fff',
          fontFamily: 'Manrope', fontWeight: 800, fontSize: 17,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(196,92,0,0.3)',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            Sending request...
          </>
        ) : `Request $${parseFloat(amount).toFixed(2)}`}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// tiny inline check for the "what happens next" list
const CheckIcon2 = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7L5.5 10.5L12 3.5" stroke={T.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Step 4: Success ────────────────────────────────────────────────────────
function StepSuccess({ recipient, amount, note, requesterName, onReset }) {
  const [showConfetti, setShowConfetti] = useState(true)
  useEffect(() => { const t = setTimeout(() => setShowConfetti(false), 2200); return () => clearTimeout(t) }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, textAlign: 'center', position: 'relative' }}>
      {showConfetti && <Confetti />}

      {/* Orange check */}
      <div style={{
        width: 88, height: 88, borderRadius: '50%',
        background: T.grad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(196,92,0,0.35)',
        animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <CheckIcon />
      </div>
      <style>{`@keyframes popIn { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

      <div>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, color: T.text, marginBottom: 6 }}>Request sent!</h2>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: T.sub }}>
          {recipient.name} has been notified
        </p>
        {note && <p style={{ fontFamily: 'Inter', fontSize: 14, color: T.muted, marginTop: 6 }}>"{note}"</p>}
      </div>

      {/* In-app notification preview */}
      <div style={{
        width: '100%', backgroundColor: '#1C1C1E', borderRadius: 16,
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: T.grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1C9 1 4.5 3.5 4.5 8V12.5L2.5 14.5V15.5H15.5V14.5L13.5 12.5V8C13.5 3.5 9 1 9 1Z" fill="white"/>
          </svg>
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: '#fff' }}>VerdexPay</div>
          <div style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
            {requesterName} is requesting ${parseFloat(amount).toFixed(2)} USDC{note ? ` · "${note}"` : ''}
          </div>
        </div>
        <div style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>now</div>
      </div>

      {/* Receipt */}
      <div style={{
        width: '100%', backgroundColor: T.bg, borderRadius: 16,
        padding: '20px 24px', border: `1.5px solid ${T.border}`,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {[
          { label: 'Requested from', value: `${recipient.name} (${recipient.handle})` },
          { label: 'Amount',         value: `$${parseFloat(amount).toFixed(2)} USDC` },
          { label: 'Status',         value: '⏳ Pending payment' },
          { label: 'Sent',           value: 'Just now' },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Inter', fontSize: 13, color: T.sub }}>{label}</span>
            <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 13, color: T.text }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <button
          onClick={() => {
            const url = `${window.location.origin}/pay/@${recipient.handle?.replace('@','') || recipient.address}/${parseFloat(amount).toFixed(2)}${note ? `?note=${encodeURIComponent(note)}` : ''}`
            navigator.clipboard.writeText(url)
          }}
          style={{
            flex: 1, padding: '14px', borderRadius: 12,
            border: `1.5px solid ${T.primary}`, backgroundColor: 'transparent',
            fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: T.primary,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          <ShareIcon /> Copy link
        </button>
        <button style={{
          flex: 1, padding: '14px', borderRadius: 12,
          border: `1.5px solid ${T.border}`, backgroundColor: 'transparent',
          fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: T.muted,
          cursor: 'pointer',
        }}>
          Remind later
        </button>
      </div>

      <button onClick={onReset} style={{
        padding: '16px', borderRadius: 14, border: 'none', width: '100%',
        background: T.grad, color: '#fff',
        fontFamily: 'Manrope', fontWeight: 800, fontSize: 16,
        cursor: 'pointer', boxShadow: '0 4px 16px rgba(196,92,0,0.28)',
      }}>
        Request again
      </button>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Request() {
  const { walletAddress } = useAuth()
  const { profile } = useUserProfile(walletAddress)
  const [step, setStep]           = useState(0)
  const [recipient, setRecipient] = useState(null)
  const [txData, setTxData]       = useState({ amount: '', note: '' })

  const handleReset = () => { setStep(0); setRecipient(null); setTxData({ amount: '', note: '' }) }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: T.bg }}>
      <Sidebar />
      <div style={{ marginLeft: 256, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 32px' }}>
          <div style={{
            width: '100%', maxWidth: 480,
            backgroundColor: T.card, borderRadius: 20,
            padding: 36, boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
          }}>
            <ProgressBar step={step} />
            <div style={{ marginTop: 28 }}>
              {step === 0 && <StepRecipient onNext={(r) => { setRecipient(r); setStep(1) }} />}
              {step === 1 && <StepAmount recipient={recipient} onNext={(d) => { setTxData(d); setStep(2) }} onBack={() => setStep(0)} />}
              {step === 2 && <StepReview recipient={recipient} amount={txData.amount} note={txData.note} requesterAddress={walletAddress} requesterUsername={profile?.username} onConfirm={() => setStep(3)} onBack={() => setStep(1)} />}
              {step === 3 && <StepSuccess recipient={recipient} amount={txData.amount} note={txData.note} requesterName={profile?.display_name || (profile?.username ? '@' + profile.username : 'You')} onReset={handleReset} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
