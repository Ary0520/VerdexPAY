import React, { useState, useEffect } from 'react'
import { QRShowModal } from '../components/QRModal'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { resolveHandle } from '../hooks/useUserProfile'
import { useUserProfile } from '../hooks/useUserProfile'
import { useSendUsdc } from '../hooks/useSendUsdc'

const G = {
  green: '#006D33', grad: 'linear-gradient(174deg, #006D33 0%, #00D66B 100%)',
  text: '#191C1D', sub: '#6B7280', border: '#E5E2E1', bg: '#F8F9FA', card: '#FFFFFF',
  red: '#BA1A1A',
}

const PRESETS = [5, 10, 25, 50]

function Avatar({ profile, size = 72 }) {
  const initials = (profile?.display_name?.[0] ?? profile?.username?.[0] ?? '?').toUpperCase()
  if (profile?.avatar_url) {
    return <img src={profile.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${G.border}` }}/>
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: 'rgba(0,109,51,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: size * 0.35, color: G.green, border: `3px solid ${G.border}`, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

export default function Pay() {
  const { handle }          = useParams()           // @aryan or aryan
  const [searchParams]      = useSearchParams()
  const presetAmount        = searchParams.get('amount') ?? ''
  const presetNote          = searchParams.get('note')   ?? ''

  const navigate            = useNavigate()
  const { authenticated, walletAddress } = useAuth()
  const { profile: senderProfile } = useUserProfile(walletAddress)
  const { send, loading, error } = useSendUsdc()

  const [recipient,  setRecipient]  = useState(null)   // resolved profile from Supabase
  const [notFound,   setNotFound]   = useState(false)
  const [amount,     setAmount]     = useState(presetAmount)
  const [note,       setNote]       = useState(presetNote)
  const [done,       setDone]       = useState(false)
  const [txHash,     setTxHash]     = useState(null)
  const [txError,    setTxError]    = useState(null)
  const [showQR,     setShowQR]     = useState(false)

  // Resolve handle on mount
  useEffect(() => {
    const clean = handle?.replace(/^@/, '')
    if (!clean) return
    resolveHandle(clean).then(data => {
      if (data) setRecipient(data)
      else setNotFound(true)
    })
  }, [handle])

  const handleAmountKey = (e) => {
    const allowed = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','ArrowLeft','ArrowRight','Tab']
    if (!allowed.includes(e.key)) e.preventDefault()
    if (e.key === '.' && amount.includes('.')) e.preventDefault()
  }

  const numVal = parseFloat(amount) || 0
  const valid  = numVal > 0 && !!recipient && authenticated

  const handlePay = async () => {
    if (!authenticated) {
      // Save destination in sessionStorage, redirect to login
      sessionStorage.setItem('pay_redirect', window.location.pathname + window.location.search)
      navigate('/login')
      return
    }
    setTxError(null)
    try {
      const hash = await send({
        toAddress:        recipient.wallet_address,
        amount,
        note,
        senderAddress:    walletAddress,
        senderUsername:   senderProfile?.username,
        receiverUsername: recipient.username,
      })
      setTxHash(hash)
      setDone(true)
    } catch (e) {
      setTxError(e?.shortMessage ?? e?.message ?? 'Payment failed')
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────
  if (!recipient && !notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: G.bg }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(0,109,51,0.2)', borderTopColor: G.green, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: G.bg, flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, color: G.text }}>@{handle?.replace(/^@/,'')} not found</div>
        <div style={{ fontFamily: 'Inter', fontSize: 14, color: G.sub }}>This payment link doesn't exist</div>
        <button onClick={() => navigate('/dashboard')} style={{ marginTop: 8, padding: '12px 28px', borderRadius: 12, border: 'none', background: G.grad, color: '#fff', fontFamily: 'Manrope', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Go to VerdexPay
        </button>
      </div>
    )
  }

  const displayName = recipient.display_name || '@' + recipient.username

  // ── Success ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ backgroundColor: G.card, borderRadius: 20, padding: 40, maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: G.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,109,51,0.3)', animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M7 18L14 25L29 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 28, color: G.text }}>Sent!</div>
            <div style={{ fontFamily: 'Inter', fontSize: 15, color: G.sub, marginTop: 4 }}>
              ${parseFloat(amount).toFixed(2)} USDC to {displayName}
            </div>
            {note && <div style={{ fontFamily: 'Inter', fontSize: 13, color: G.sub, marginTop: 4 }}>"{note}"</div>}
          </div>
          {txHash && (
            <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: G.green, textDecoration: 'none' }}>
              View on explorer ↗
            </a>
          )}
          <button onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: G.grad, color: '#fff', fontFamily: 'Manrope', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            Back to dashboard
          </button>
          <style>{`@keyframes popIn { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        </div>
      </div>
    )
  }

  // ── Pay form ───────────────────────────────────────────────────────────
  const isAuthenticated = authenticated

  return (
    <div style={{ minHeight: '100vh', backgroundColor: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* bg blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,214,107,0.1) 0%, transparent 70%)', top: -100, right: -60 }}/>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,109,51,0.07) 0%, transparent 70%)', bottom: -60, left: -40 }}/>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        {/* VerdexPay branding */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, color: G.green }}>VerdexPay</div>
        </div>

        <div style={{ backgroundColor: G.card, borderRadius: 20, padding: '36px 32px', boxShadow: '0 4px 40px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recipient */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Avatar profile={recipient} size={72} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: G.text }}>{displayName}</div>
              <div style={{ fontFamily: 'Inter', fontSize: 13, color: G.sub }}>@{recipient.username}</div>
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: G.border }} />

          {/* Amount */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 48, color: amount ? G.text : '#D1D5DB', lineHeight: 1 }}>$</span>
              <input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={handleAmountKey}
                placeholder="0"
                inputMode="decimal"
                autoFocus={!presetAmount}
                style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 48, lineHeight: 1, color: G.text, background: 'none', border: 'none', outline: 'none', width: Math.max(52, (amount.length || 1) * 30), textAlign: 'left' }}
              />
              <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: G.sub, alignSelf: 'flex-end', paddingBottom: 8 }}>USDC</span>
            </div>
          </div>

          {/* Presets */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {PRESETS.map(p => (
              <button key={p} onClick={() => setAmount(String(p))} style={{
                padding: '7px 16px', borderRadius: 9999,
                border: `1.5px solid ${amount === String(p) ? G.green : G.border}`,
                backgroundColor: amount === String(p) ? 'rgba(0,109,51,0.07)' : '#fff',
                fontFamily: 'Manrope', fontWeight: 700, fontSize: 13,
                color: amount === String(p) ? G.green : G.sub, cursor: 'pointer',
              }}>${p}</button>
            ))}
          </div>

          {/* Note */}
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note... (optional)"
            maxLength={80}
            style={{ padding: '13px 16px', backgroundColor: G.bg, border: `2px solid transparent`, borderRadius: 12, fontFamily: 'Inter', fontSize: 14, color: G.text, outline: 'none', transition: 'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor = G.green}
            onBlur={e => e.target.style.borderColor = 'transparent'}
          />

          {/* Error */}
          {txError && (
            <div style={{ padding: '10px 14px', backgroundColor: 'rgba(186,26,26,0.08)', borderRadius: 10, border: '1px solid rgba(186,26,26,0.2)' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: G.red }}>⚠ {txError}</span>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handlePay}
            disabled={loading || (isAuthenticated && !valid)}
            style={{
              padding: '16px', borderRadius: 14, border: 'none',
              background: (!isAuthenticated || valid) && !loading ? G.grad : G.border,
              color: (!isAuthenticated || valid) && !loading ? '#fff' : '#9CA3AF',
              fontFamily: 'Manrope', fontWeight: 800, fontSize: 17,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: (!isAuthenticated || valid) && !loading ? '0 4px 20px rgba(0,109,51,0.28)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s',
            }}
          >
            {loading
              ? <><span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}/> Sending...</>
              : !isAuthenticated
                ? `Sign in to pay ${displayName}`
                : `Pay $${numVal > 0 ? numVal.toFixed(2) : '0.00'} USDC`
            }
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          <div style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 11, color: G.sub }}>
            Powered by VerdexPay · Instant · Gasless
          </div>
        </div>

        {/* QR button below card */}
        <button onClick={() => setShowQR(true)} style={{ marginTop: 16, width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid rgba(0,109,51,0.3)', backgroundColor: 'rgba(0,109,51,0.05)', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: G.green, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="0.5" stroke={G.green} strokeWidth="1.3"/>
            <rect x="10" y="1" width="5" height="5" rx="0.5" stroke={G.green} strokeWidth="1.3"/>
            <rect x="1" y="10" width="5" height="5" rx="0.5" stroke={G.green} strokeWidth="1.3"/>
            <rect x="2.5" y="2.5" width="2" height="2" fill={G.green}/>
            <rect x="11.5" y="2.5" width="2" height="2" fill={G.green}/>
            <rect x="2.5" y="11.5" width="2" height="2" fill={G.green}/>
            <path d="M10 10H12V12H10ZM12 12H14V14H12ZM14 10H16V12H14ZM10 14H12V16H10ZM14 14H16V16H14Z" fill={G.green}/>
          </svg>
          Show QR code
        </button>
      </div>

      {showQR && recipient && (
        <QRShowModal
          url={`${window.location.origin}/pay/@${recipient.username}${amount ? `/${amount}` : ''}${note ? `?note=${encodeURIComponent(note)}` : ''}`}
          title={`Pay ${recipient.display_name || '@' + recipient.username}`}
          subtitle="Scan to pay instantly"
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  )
}
