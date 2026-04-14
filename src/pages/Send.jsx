import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { useSendUsdc } from '../hooks/useSendUsdc'
import { resolveHandle, useUserProfile } from '../hooks/useUserProfile'
import { createPaymentRequest } from '../hooks/usePaymentRequests'
import { QRScanner, parseQRResult } from '../components/QRScanner'
import { useUsdcBalance } from '../hooks/useUsdcBalance'
import { useIsMobile } from '../hooks/useIsMobile'

// ── theme tokens — driven by mode ──────────────────────────────────────────
const THEMES = {
  send: {
    primary:   '#006D33',
    grad:      'linear-gradient(174deg, #006D33 0%, #00D66B 100%)',
    gradLight: 'rgba(0,109,51,0.08)',
    shadow:    'rgba(0,109,51,0.28)',
    confetti:  ['#006D33','#00D66B','#FFA478','#FFD700','#FF6B6B','#4ECDC4'],
  },
  request: {
    primary:   '#C45C00',
    grad:      'linear-gradient(174deg, #C45C00 0%, #FFA478 100%)',
    gradLight: 'rgba(196,92,0,0.08)',
    shadow:    'rgba(196,92,0,0.28)',
    confetti:  ['#C45C00','#FFA478','#FFD700','#FF6B6B','#FFF4EE','#E8650A'],
  },
}
const C = { text: '#191C1D', sub: '#6B7280', muted: '#3C4A3D', border: '#E5E2E1', bg: '#F8F9FA', card: '#FFFFFF' }

// ── icons ──────────────────────────────────────────────────────────────────
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#6B7280" strokeWidth="1.5"/><path d="M11 11L14 14" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
const QRIcon = ({ color }) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="5" height="5" rx="0.5" stroke={color} strokeWidth="1.3"/><rect x="10" y="1" width="5" height="5" rx="0.5" stroke={color} strokeWidth="1.3"/><rect x="1" y="10" width="5" height="5" rx="0.5" stroke={color} strokeWidth="1.3"/><rect x="2.5" y="2.5" width="2" height="2" fill={color}/><rect x="11.5" y="2.5" width="2" height="2" fill={color}/><rect x="2.5" y="11.5" width="2" height="2" fill={color}/><path d="M10 10H12V12H10ZM12 12H14V14H12ZM14 10H16V12H14ZM10 14H12V16H10ZM14 14H16V16H14Z" fill={color}/></svg>
const BackIcon = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const CheckIcon = () => <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M8 20L16 28L32 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
const ShareIcon = ({ color }) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="13" cy="3" r="2" stroke={color} strokeWidth="1.3"/><circle cx="3" cy="8" r="2" stroke={color} strokeWidth="1.3"/><circle cx="13" cy="13" r="2" stroke={color} strokeWidth="1.3"/><path d="M5 7L11 4M5 9L11 12" stroke={color} strokeWidth="1.3"/></svg>

const PRESETS = [10, 25, 50, 100]
const EMOJIS  = ['☕','🍕','🎉','🙏','❤️','🍺','🎁','✈️']

// ── shared sub-components ──────────────────────────────────────────────────
function Avatar({ contact, size = 48, primary }) {
  if (contact.avatar) return <img src={contact.avatar} alt={contact.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}/>
  return <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: size * 0.3, color: '#fff', flexShrink: 0 }}>{contact.initials}</div>
}

function AmountPill({ children, onClick, active, primary }) {
  return (
    <button onClick={onClick} style={{ padding: '8px 18px', borderRadius: 9999, border: active ? `2px solid ${primary}` : `1.5px solid ${C.border}`, backgroundColor: active ? `${primary}14` : '#fff', fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: active ? primary : C.muted, cursor: 'pointer', transition: 'all 0.15s' }}>
      {children}
    </button>
  )
}

function Confetti({ colors }) {
  const pieces = Array.from({ length: 32 }, (_, i) => ({ id: i, color: colors[i % colors.length], left: `${Math.random()*100}%`, delay: `${Math.random()*0.6}s`, size: 6+Math.random()*6, rotate: Math.random()*360 }))
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{`@keyframes cf{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(340px) rotate(720deg);opacity:0}}`}</style>
      {pieces.map(p => <div key={p.id} style={{ position: 'absolute', top: 0, left: p.left, width: p.size, height: p.size, backgroundColor: p.color, borderRadius: 2, animation: `cf 1.4s ease-in ${p.delay} forwards`, transform: `rotate(${p.rotate}deg)` }}/>)}
    </div>
  )
}

// ── Mode toggle ────────────────────────────────────────────────────────────
function ModeToggle({ mode, onChange }) {
  return (
    <div style={{ display: 'flex', backgroundColor: C.bg, borderRadius: 12, padding: 4, gap: 2, marginBottom: 24 }}>
      {['send','request'].map(m => (
        <button key={m} onClick={() => onChange(m)} style={{
          flex: 1, padding: '10px', borderRadius: 9, border: 'none',
          backgroundColor: mode === m ? C.card : 'transparent',
          boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          fontFamily: 'Manrope', fontWeight: 800, fontSize: 14,
          color: mode === m ? (m === 'send' ? THEMES.send.primary : THEMES.request.primary) : C.sub,
          cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
        }}>
          {m === 'send' ? '↑ Send' : '↓ Request'}
        </button>
      ))}
    </div>
  )
}

// ── Progress bar ───────────────────────────────────────────────────────────
function ProgressBar({ step, primary }) {
  const steps = ['Recipient', 'Amount', 'Review', 'Done']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: i <= step ? primary : C.border, border: i === step ? `3px solid ${primary}30` : '3px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
              {i < step
                ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 11, color: i === step ? '#fff' : '#9CA3AF' }}>{i+1}</span>
              }
            </div>
            <span style={{ fontFamily: 'Inter', fontSize: 10, color: i <= step ? primary : '#9CA3AF', fontWeight: i === step ? 700 : 400 }}>{s}</span>
          </div>
          {i < steps.length-1 && <div style={{ flex: 1, height: 2, backgroundColor: i < step ? primary : C.border, marginBottom: 16, transition: 'background-color 0.3s' }}/>}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Step 1: Recipient (shared) ─────────────────────────────────────────────
function StepRecipient({ mode, theme, onNext }) {
  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState([])
  const [selected,  setSelected]  = useState(null)
  const [searching, setSearching] = useState(false)
  const [debounce,  setDebounce]  = useState(null)
  const [scanning,  setScanning]  = useState(false)
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  const isRawAddress = /^0x[0-9a-fA-F]{40}$/.test(query.trim())

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val); setSelected(null)
    if (debounce) clearTimeout(debounce)
    if (!val.trim() || val.length < 2 || /^0x[0-9a-fA-F]{40}$/.test(val.trim())) { setResults([]); return }
    setSearching(true)
    setDebounce(setTimeout(async () => {
      const r = await resolveHandle(val.trim())
      setResults(r ? [r] : [])
      setSearching(false)
    }, 400))
  }

  const handleSelect = (r) => { setSelected(r); setQuery('@' + r.username); setResults([]) }

  const handleQRScan = async (raw) => {
    setScanning(false)
    const parsed = parseQRResult(raw)
    if (!parsed) return
    if (parsed.type === 'address') {
      onNext({ name: parsed.address.slice(0,6)+'...'+parsed.address.slice(-4), handle: parsed.address, address: parsed.address, initials: '?', color: C.sub })
    } else if (parsed.type === 'handle') {
      const p = await resolveHandle(parsed.handle)
      if (p) onNext({ name: p.display_name || '@'+p.username, handle: '@'+p.username, address: p.wallet_address, initials: (p.display_name?.[0]||p.username[0]).toUpperCase(), color: theme.primary, avatar: p.avatar_url, prefillAmount: parsed.amount, prefillNote: parsed.note })
    }
  }

  const rawContact = isRawAddress ? { username: query.trim().slice(0,6)+'...'+query.trim().slice(-4), display_name: 'Direct address', wallet_address: query.trim() } : null
  const canContinue = selected || isRawAddress

  const handleContinue = () => {
    if (isRawAddress && !selected) { onNext({ name: rawContact.username, handle: rawContact.wallet_address, address: rawContact.wallet_address, initials: '?', color: C.sub }); return }
    if (selected) onNext({ name: selected.display_name || '@'+selected.username, handle: '@'+selected.username, address: selected.wallet_address, initials: (selected.display_name?.[0]||selected.username[0]).toUpperCase(), color: theme.primary, avatar: selected.avatar_url })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 26, color: C.text, marginBottom: 4 }}>
          {mode === 'send' ? 'Who are you sending to?' : 'Who do you want to request from?'}
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: C.sub }}>
          {mode === 'send' ? 'Instant · Gasless · Arrives in <3s' : "They'll get a notification to pay you"}
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><SearchIcon /></div>
        <input ref={inputRef} value={query} onChange={handleChange} placeholder="@username or 0x address"
          style={{ width: '100%', padding: '15px 120px 15px 48px', backgroundColor: '#F3F4F5', border: `2px solid transparent`, borderRadius: 14, fontFamily: 'Inter', fontSize: 15, color: C.text, outline: 'none', transition: 'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = theme.primary}
          onBlur={e => e.target.style.borderColor = 'transparent'}
        />
        <button onClick={() => setScanning(true)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', backgroundColor: theme.gradLight, border: 'none', borderRadius: 9999, cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: theme.primary }}>
          <QRIcon color={theme.primary}/> Scan
        </button>
      </div>

      {(results.length > 0 || searching || isRawAddress) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {searching && <div style={{ padding: '10px 16px', fontFamily: 'Inter', fontSize: 13, color: C.sub }}>Searching...</div>}
          {results.map(r => (
            <button key={r.wallet_address} onClick={() => handleSelect(r)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12, backgroundColor: selected?.wallet_address === r.wallet_address ? theme.gradLight : '#F3F4F5', border: selected?.wallet_address === r.wallet_address ? `1.5px solid ${theme.primary}33` : '1.5px solid transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s' }}>
              {r.avatar_url
                ? <img src={r.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}/>
                : <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, color: '#fff', flexShrink: 0 }}>{(r.display_name?.[0]||r.username[0]).toUpperCase()}</div>
              }
              <div>
                <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: C.text }}>{r.display_name || r.username}</div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.sub }}>@{r.username}</div>
              </div>
              {selected?.wallet_address === r.wallet_address && <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', backgroundColor: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
            </button>
          ))}
          {isRawAddress && <div style={{ padding: '10px 16px', backgroundColor: theme.gradLight, borderRadius: 10 }}><span style={{ fontFamily: 'Inter', fontSize: 12, color: theme.primary }}>✓ Valid address</span></div>}
        </div>
      )}

      <button onClick={handleContinue} disabled={!canContinue} style={{ padding: '16px', borderRadius: 14, border: 'none', background: canContinue ? theme.grad : C.border, color: canContinue ? '#fff' : '#9CA3AF', fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, cursor: canContinue ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: canContinue ? `0 4px 16px ${theme.shadow}` : 'none' }}>
        Continue →
      </button>

      {scanning && <QRScanner onScan={handleQRScan} onClose={() => setScanning(false)} />}
    </div>
  )
}

// ── Step 2: Amount (shared) ────────────────────────────────────────────────
function StepAmount({ mode, theme, recipient, balance, onNext, onBack }) {
  const [amount,     setAmount]     = useState(recipient.prefillAmount ?? '')
  const [note,       setNote]       = useState(recipient.prefillNote   ?? '')
  const [showEmojis, setShowEmojis] = useState(false)
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  const handleAmountKey = (e) => {
    const ok = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','ArrowLeft','ArrowRight','Tab']
    if (!ok.includes(e.key)) e.preventDefault()
    if (e.key === '.' && amount.includes('.')) e.preventDefault()
  }

  const numVal = parseFloat(amount) || 0
  const maxVal = mode === 'send' ? parseFloat(balance ?? '0') : Infinity
  const valid  = numVal > 0 && (mode === 'request' || numVal <= maxVal)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex' }}><BackIcon /></button>
        <Avatar contact={recipient} size={36} primary={theme.primary} />
        <div>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: C.text }}>{recipient.name}</div>
          <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.sub }}>{recipient.handle}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '20px 0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 52, color: amount ? theme.primary : '#D1D5DB', lineHeight: 1 }}>$</span>
          <input ref={inputRef} value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={handleAmountKey} placeholder="0" inputMode="decimal"
            style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 52, lineHeight: 1, color: theme.primary, background: 'none', border: 'none', outline: 'none', width: Math.max(60, (amount.length||1)*30), textAlign: 'left' }}
          />
          <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: C.sub, alignSelf: 'flex-end', paddingBottom: 8 }}>USDC</span>
        </div>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
          {mode === 'send' ? `Balance: $${balance ?? '0.00'}` : "They'll receive a notification to pay"}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {PRESETS.map(p => <AmountPill key={p} active={amount === String(p)} onClick={() => setAmount(String(p))} primary={theme.primary}>${p}</AmountPill>)}
        {mode === 'send' && balance && <AmountPill active={amount === balance} onClick={() => setAmount(balance)} primary={theme.primary}>Max</AmountPill>}
      </div>

      <div style={{ position: 'relative' }}>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder={mode === 'send' ? 'Add a note... (optional)' : "What's it for? (optional)"} maxLength={80}
          style={{ width: '100%', padding: '13px 48px 13px 16px', backgroundColor: '#F3F4F5', border: `2px solid transparent`, borderRadius: 12, fontFamily: 'Inter', fontSize: 14, color: C.text, outline: 'none', transition: 'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = theme.primary}
          onBlur={e => e.target.style.borderColor = 'transparent'}
        />
        <button onClick={() => setShowEmojis(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>😊</button>
        {showEmojis && (
          <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 10, backgroundColor: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', gap: 8, flexWrap: 'wrap', width: 200 }}>
            {EMOJIS.map(e => <button key={e} onClick={() => { setNote(n => n+e); setShowEmojis(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 4, borderRadius: 6 }}>{e}</button>)}
          </div>
        )}
      </div>

      <button onClick={() => valid && onNext({ amount, note })} disabled={!valid}
        style={{ padding: '16px', borderRadius: 14, border: 'none', background: valid ? theme.grad : C.border, color: valid ? '#fff' : '#9CA3AF', fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, cursor: valid ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: valid ? `0 4px 16px ${theme.shadow}` : 'none' }}>
        Review →
      </button>
    </div>
  )
}

// ── Step 3: Review (mode-aware) ────────────────────────────────────────────
function StepReview({ mode, theme, recipient, amount, note, onConfirm, onBack, senderAddress, senderUsername }) {
  const { send }          = useSendUsdc()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleConfirm = async () => {
    setLoading(true); setError(null)
    try {
      if (mode === 'send') {
        const hash = await send({ toAddress: recipient.address, amount, note, senderAddress, senderUsername, receiverUsername: recipient.handle?.replace('@','') || null })
        onConfirm(hash)
      } else {
        await createPaymentRequest({ requesterAddress: senderAddress, requesterUsername: senderUsername, payerAddress: recipient.address, payerUsername: recipient.handle?.replace('@','') || null, amount, note })
        onConfirm(null)
      }
    } catch (e) {
      setError(e?.shortMessage ?? e?.message ?? 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex' }}><BackIcon /></button>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, color: C.text }}>
          {mode === 'send' ? 'Review & Confirm' : 'Review Request'}
        </h2>
      </div>

      <div style={{ backgroundColor: C.bg, borderRadius: 16, padding: 24, border: `1.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Avatar contact={recipient} size={60} primary={theme.primary} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 16, color: C.text }}>{recipient.name}</div>
            <div style={{ fontFamily: 'Inter', fontSize: 13, color: C.sub }}>{recipient.handle}</div>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: C.border }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Inter', fontSize: 13, color: C.sub, marginBottom: 4 }}>
            {mode === 'send' ? 'You send' : "You're requesting"}
          </div>
          <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 40, color: theme.primary, lineHeight: 1 }}>${parseFloat(amount).toFixed(2)}</div>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: C.sub, marginTop: 4 }}>USDC</div>
        </div>

        {note && <div style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 14, color: C.muted, backgroundColor: '#fff', borderRadius: 10, padding: '10px 16px' }}>"{note}"</div>}

        <div style={{ height: 1, backgroundColor: C.border }} />

        {mode === 'send' ? (
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[['⚡','Instant'],['🆓','Gas sponsored'],['<3s','Arrives fast']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: theme.gradLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{icon}</div>
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 11, color: theme.primary, textAlign: 'center' }}>{label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 11, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>What happens next</p>
            {[`${recipient.name} gets a push notification`, 'They can pay with one tap', 'You get notified when paid'].map(label => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: theme.gradLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>→</div>
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: C.muted }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div style={{ padding: '12px 16px', backgroundColor: 'rgba(186,26,26,0.08)', borderRadius: 10, border: '1px solid rgba(186,26,26,0.2)' }}><span style={{ fontFamily: 'Inter', fontSize: 13, color: '#BA1A1A' }}>⚠ {error}</span></div>}

      <button onClick={handleConfirm} disabled={loading}
        style={{ padding: '17px', borderRadius: 14, border: 'none', background: loading ? C.border : theme.grad, color: loading ? '#9CA3AF' : '#fff', fontFamily: 'Manrope', fontWeight: 800, fontSize: 17, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : `0 4px 20px ${theme.shadow}`, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {loading
          ? <><span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}/> {mode === 'send' ? 'Sending...' : 'Sending request...'}</>
          : mode === 'send' ? 'Confirm & Send' : `Request $${parseFloat(amount).toFixed(2)}`
        }
      </button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Step 4: Success (mode-aware) ───────────────────────────────────────────
function StepSuccess({ mode, theme, recipient, amount, note, txHash, senderName, onReset }) {
  const [showConfetti, setShowConfetti] = useState(true)
  useEffect(() => { const t = setTimeout(() => setShowConfetti(false), 2200); return () => clearTimeout(t) }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center', position: 'relative' }}>
      {showConfetti && <Confetti colors={theme.confetti} />}

      <div style={{ width: 88, height: 88, borderRadius: '50%', background: theme.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 32px ${theme.shadow}`, animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <CheckIcon />
      </div>
      <style>{`@keyframes popIn{from{transform:scale(0.4);opacity:0}to{transform:scale(1);opacity:1}}`}</style>

      <div>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 30, color: C.text, marginBottom: 6 }}>
          {mode === 'send' ? 'Sent!' : 'Request sent!'}
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: C.sub }}>
          {mode === 'send' ? `$${parseFloat(amount).toFixed(2)} USDC to ${recipient.name}` : `${recipient.name} has been notified`}
        </p>
        {note && <p style={{ fontFamily: 'Inter', fontSize: 13, color: C.muted, marginTop: 4 }}>"{note}"</p>}
      </div>

      {/* Notification preview for request mode */}
      {mode === 'request' && (
        <div style={{ width: '100%', backgroundColor: '#1C1C1E', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: theme.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🔔</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: '#fff' }}>VerdexPay</div>
            <div style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              {senderName} is requesting ${parseFloat(amount).toFixed(2)} USDC{note ? ` · "${note}"` : ''}
            </div>
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>now</div>
        </div>
      )}

      {/* Receipt */}
      <div style={{ width: '100%', backgroundColor: C.bg, borderRadius: 16, padding: '18px 22px', border: `1.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(mode === 'send'
          ? [['To', `${recipient.name} (${recipient.handle})`], ['Amount', `$${parseFloat(amount).toFixed(2)} USDC`], ['Fee', 'Free'], ['Status', '✅ Confirmed']]
          : [['Requested from', `${recipient.name} (${recipient.handle})`], ['Amount', `$${parseFloat(amount).toFixed(2)} USDC`], ['Status', '⏳ Pending payment'], ['Sent', 'Just now']]
        ).map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Inter', fontSize: 13, color: C.sub }}>{label}</span>
            <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 13, color: C.text }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        {mode === 'send' && txHash && (
          <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, padding: '13px', borderRadius: 12, border: `1.5px solid ${theme.primary}`, backgroundColor: 'transparent', fontFamily: 'Manrope', fontWeight: 700, fontSize: 13, color: theme.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
            <ShareIcon color={theme.primary}/> Explorer
          </a>
        )}
        {mode === 'request' && (
          <button onClick={() => { const url = `${window.location.origin}/pay/@${recipient.handle?.replace('@','')||recipient.address}/${parseFloat(amount).toFixed(2)}${note?`?note=${encodeURIComponent(note)}`:''}` ; navigator.clipboard.writeText(url) }}
            style={{ flex: 1, padding: '13px', borderRadius: 12, border: `1.5px solid ${theme.primary}`, backgroundColor: 'transparent', fontFamily: 'Manrope', fontWeight: 700, fontSize: 13, color: theme.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ShareIcon color={theme.primary}/> Copy link
          </button>
        )}
      </div>

      <button onClick={onReset} style={{ padding: '15px', borderRadius: 14, border: 'none', width: '100%', background: theme.grad, color: '#fff', fontFamily: 'Manrope', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: `0 4px 16px ${theme.shadow}` }}>
        {mode === 'send' ? 'Send again' : 'Request again'}
      </button>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Send() {
  const { walletAddress } = useAuth()
  const { profile }       = useUserProfile(walletAddress)
  const { balance }       = useUsdcBalance(walletAddress)
  const [searchParams]    = useSearchParams()

  const [mode,      setMode]      = useState(() => searchParams.get('mode') === 'request' ? 'request' : 'send')
  const [step,      setStep]      = useState(0)
  const [recipient, setRecipient] = useState(null)
  const [txData,    setTxData]    = useState({ amount: '', note: '' })
  const [txHash,    setTxHash]    = useState(null)

  const theme = THEMES[mode]

  // Pre-fill from QR / URL params
  useEffect(() => {
    const handle  = searchParams.get('handle')
    const address = searchParams.get('address')
    const amount  = searchParams.get('amount') ?? ''
    const note    = searchParams.get('note')   ?? ''
    if (handle) {
      resolveHandle(handle).then(p => {
        if (!p) return
        setRecipient({ name: p.display_name||'@'+p.username, handle: '@'+p.username, address: p.wallet_address, initials: (p.display_name?.[0]||p.username[0]).toUpperCase(), color: THEMES.send.primary, avatar: p.avatar_url, prefillAmount: amount, prefillNote: note })
        setStep(amount ? 2 : 1)
        if (amount) setTxData({ amount, note })
      })
    } else if (address) {
      setRecipient({ name: address.slice(0,6)+'...'+address.slice(-4), handle: address, address, initials: '?', color: C.sub })
      setStep(1)
    }
  }, [])

  const handleModeChange = (m) => {
    setMode(m)
    // Only reset if on step 0 — don't disrupt mid-flow
    if (step === 0) { setRecipient(null); setTxData({ amount: '', note: '' }); setTxHash(null) }
  }

  const isMobile = useIsMobile()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg, overflowX: 'hidden' }}>
      {!isMobile && <Sidebar />}

      <div style={{ marginLeft: isMobile ? 0 : 256, flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? 72 : 0, minWidth: 0 }}>
        {isMobile ? (
          /* Mobile header — just a back arrow + title */
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', backgroundColor: C.bg, position: 'sticky', top: 0, zIndex: 10, borderBottom: `1px solid ${C.border}` }}>
            <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 17, color: C.text }}>
              {mode === 'send' ? 'Send & Request' : 'Send & Request'}
            </span>
          </div>
        ) : (
          <Header />
        )}

        <main style={{
          flex: 1,
          display: 'flex',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          justifyContent: 'center',
          padding: isMobile ? '0' : '40px 32px',
        }}>
          <div style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : 480,
            backgroundColor: C.card,
            borderRadius: isMobile ? 0 : 20,
            padding: isMobile ? '20px 16px' : 36,
            boxShadow: isMobile ? 'none' : '0 4px 32px rgba(0,0,0,0.07)',
            minHeight: isMobile ? 'calc(100vh - 120px)' : 'auto',
          }}>
            {step === 0 && <ModeToggle mode={mode} onChange={handleModeChange} />}
            <ProgressBar step={step} primary={theme.primary} />
            <div style={{ marginTop: 4 }}>
              {step === 0 && <StepRecipient mode={mode} theme={theme} onNext={r => { setRecipient(r); setStep(1) }} />}
              {step === 1 && <StepAmount mode={mode} theme={theme} recipient={recipient} balance={balance} onNext={d => { setTxData(d); setStep(2) }} onBack={() => setStep(0)} />}
              {step === 2 && <StepReview mode={mode} theme={theme} recipient={recipient} amount={txData.amount} note={txData.note} senderAddress={walletAddress} senderUsername={profile?.username} onConfirm={hash => { setTxHash(hash); setStep(3) }} onBack={() => setStep(1)} />}
              {step === 3 && <StepSuccess mode={mode} theme={theme} recipient={recipient} amount={txData.amount} note={txData.note} txHash={txHash} senderName={profile?.display_name || (profile?.username ? '@'+profile.username : 'You')} onReset={handleReset} />}
            </div>
          </div>
        </main>
      </div>

      {isMobile && <BottomNav />}
    </div>
  )
}
