import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { upsertProfile, isUsernameTaken } from '../hooks/useUserProfile'

const CHECK_REGEX = /^[a-z0-9_]{3,20}$/

export default function ClaimUsername() {
  const { walletAddress, displayName, avatarUrl } = useAuth()
  const navigate = useNavigate()

  const [input,    setInput]    = useState('')
  const [status,   setStatus]   = useState(null) // 'checking' | 'taken' | 'available' | 'error'
  const [saving,   setSaving]   = useState(false)
  const [debounce, setDebounce] = useState(null)

  const handleChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setInput(val)
    setStatus(null)
    if (debounce) clearTimeout(debounce)
    if (val.length < 3) return
    if (!CHECK_REGEX.test(val)) { setStatus('invalid'); return }
    setStatus('checking')
    setDebounce(setTimeout(async () => {
      const taken = await isUsernameTaken(val)
      setStatus(taken ? 'taken' : 'available')
    }, 500))
  }

  const handleClaim = async () => {
    if (status !== 'available' || !walletAddress) return
    setSaving(true)
    try {
      await upsertProfile({
        walletAddress,
        username: input,
        displayName: displayName,
        avatarUrl: avatarUrl,
      })
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const statusColor = { available: '#006D33', taken: '#BA1A1A', checking: '#6B7280', invalid: '#BA1A1A', error: '#BA1A1A' }
  const statusMsg   = {
    available: '✓ Available',
    taken:     '✗ Already taken',
    checking:  'Checking...',
    invalid:   '3–20 chars, letters/numbers/underscore only',
    error:     'Something went wrong, try again',
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F8F9FA',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      {/* bg blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,214,107,0.1) 0%, transparent 70%)', top: -100, right: -60 }}/>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,109,51,0.07) 0%, transparent 70%)', bottom: -60, left: -40 }}/>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 28, color: '#006D33' }}>VerdexPay</div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '40px 36px', boxShadow: '0 4px 40px rgba(0,0,0,0.08)' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}/>
              : <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(0,109,51,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: 24, color: '#006D33' }}>
                  {(displayName?.[0] ?? '?').toUpperCase()}
                </div>
            }
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: '#191C1D' }}>
                Claim your handle
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                People will send money to <strong>@{input || 'you'}</strong>
              </div>
            </div>
          </div>

          {/* Input */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <span style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              fontFamily: 'Manrope', fontWeight: 800, fontSize: 18, color: '#006D33',
            }}>@</span>
            <input
              value={input}
              onChange={handleChange}
              placeholder="yourname"
              maxLength={20}
              autoFocus
              style={{
                width: '100%', padding: '16px 16px 16px 36px',
                backgroundColor: '#F3F4F5', border: `2px solid ${status === 'available' ? '#006D33' : status === 'taken' || status === 'invalid' ? '#BA1A1A' : 'transparent'}`,
                borderRadius: 12, fontFamily: 'Manrope', fontWeight: 700, fontSize: 18,
                color: '#191C1D', outline: 'none', transition: 'border-color 0.15s',
              }}
            />
          </div>

          {/* Status */}
          <div style={{ height: 20, marginBottom: 24 }}>
            {status && (
              <span style={{ fontFamily: 'Inter', fontSize: 12, color: statusColor[status] }}>
                {statusMsg[status]}
              </span>
            )}
          </div>

          {/* Claim button */}
          <button
            onClick={handleClaim}
            disabled={status !== 'available' || saving}
            style={{
              width: '100%', padding: '16px', borderRadius: 12, border: 'none',
              background: status === 'available' && !saving
                ? 'linear-gradient(135deg, #006D33 0%, #00D66B 100%)'
                : '#E5E2E1',
              color: status === 'available' && !saving ? '#fff' : '#9CA3AF',
              fontFamily: 'Manrope', fontWeight: 800, fontSize: 16,
              cursor: status === 'available' && !saving ? 'pointer' : 'not-allowed',
              boxShadow: status === 'available' ? '0 4px 16px rgba(0,109,51,0.25)' : 'none',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {saving
              ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}/> Claiming...</>
              : `Claim @${input || 'handle'}`
            }
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          <p style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 11, color: '#9CA3AF', marginTop: 16 }}>
            ⚠️ Your handle is permanent and cannot be changed after claiming.
          </p>
        </div>
      </div>
    </div>
  )
}
