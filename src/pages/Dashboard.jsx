import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { useUsdcBalance } from '../hooks/useUsdcBalance'
import { useFundWallet } from '@privy-io/react-auth'
import { useTransactions } from '../hooks/useTransactions'
import { usePendingRequests, markRequestPaid } from '../hooks/usePaymentRequests'
import { useSendUsdc } from '../hooks/useSendUsdc'
import { useUserProfile } from '../hooks/useUserProfile'
import { useNavigate } from 'react-router-dom'
import { QRScanner, parseQRResult } from '../components/QRScanner'
import { useIsMobile } from '../hooks/useIsMobile'

// ── icons ──────────────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
    <circle cx="7" cy="5" r="3.5" stroke="#191C1D" strokeWidth="1.5"/>
    <path d="M1 15C1.5 11.5 4 9 7 9C10 9 12.5 11.5 13 15" stroke="#191C1D" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 5H19M17 3L19 5L17 7" stroke="#191C1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const RequestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="1" width="14" height="18" rx="2" stroke="#191C1D" strokeWidth="1.5"/>
    <path d="M7 7H13M7 10H13M7 13H10" stroke="#191C1D" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="14" cy="14" r="4" fill="#006D33"/>
    <path d="M14 12V16M12 14H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const ScanIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="1" y="1" width="7" height="7" rx="1" stroke="#191C1D" strokeWidth="1.5"/>
    <rect x="12" y="1" width="7" height="7" rx="1" stroke="#191C1D" strokeWidth="1.5"/>
    <rect x="1" y="12" width="7" height="7" rx="1" stroke="#191C1D" strokeWidth="1.5"/>
    <rect x="3.5" y="3.5" width="2" height="2" fill="#191C1D"/>
    <rect x="14.5" y="3.5" width="2" height="2" fill="#191C1D"/>
    <rect x="3.5" y="14.5" width="2" height="2" fill="#191C1D"/>
    <path d="M12 12H14V14H12ZM14 14H16V16H14ZM16 12H18V14H16ZM12 16H14V18H12ZM16 16H18V18H16Z" fill="#191C1D"/>
  </svg>
)
const ShareIcon = () => (
  <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
    <path d="M7 5H13M3 5C3 2.79 4.79 1 7 1H9M13 1H15C17.21 1 19 2.79 19 5C19 7.21 17.21 9 15 9H13M7 9H9" stroke="#191C1D" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const AddIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M6 1V11M1 6H11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7H12M8 3L12 7L8 11" stroke="#656464" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ChevronIcon = () => (
  <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
    <path d="M1 1L6 6L1 11" stroke="#783814" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const TrendIcon = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
    <path d="M1 7L4.5 3.5L6.5 5.5L11 1" stroke="#005627" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 1H11V4" stroke="#005627" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const BoltIcon = () => (
  <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
    <path d="M9 1L1 11H8L7 19L15 9H8L9 1Z" fill="#783814" strokeLinejoin="round"/>
  </svg>
)

const quickActions = [
  { label: 'Send',       icon: <SendIcon />,    path: '/send' },
  { label: 'Request',    icon: <RequestIcon />, path: '/send?mode=request' },
  { label: 'Scan QR',    icon: <ScanIcon />,    action: 'scan' },
  { label: 'Share link', icon: <ShareIcon />,   action: 'share' },
]

export default function Dashboard() {
  const { walletAddress } = useAuth()
  const { balance, loading, refetch } = useUsdcBalance(walletAddress)
  const { fundWallet } = useFundWallet()
  const { txs } = useTransactions(walletAddress)
  const { profile } = useUserProfile(walletAddress)
  const { requests, refetch: refetchRequests } = usePendingRequests(walletAddress)
  const { send: sendUsdc, loading: sendLoading } = useSendUsdc()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [payingId, setPayingId] = useState(null)
  const [scanning, setScanning] = useState(false)

  const displayBalance = loading ? '...' : (balance ?? '0.00')
  const recentTxs = txs.slice(0, 5)

  const handleQRScan = async (raw) => {
    setScanning(false)
    const parsed = parseQRResult(raw)
    if (!parsed) return
    if (parsed.type === 'handle') {
      navigate('/send?handle=' + encodeURIComponent(parsed.handle) + (parsed.amount ? '&amount=' + parsed.amount : ''))
    } else if (parsed.type === 'address') {
      navigate('/send?address=' + parsed.address)
    }
  }

  const handlePayRequest = async (req) => {
    setPayingId(req.id)
    try {
      await sendUsdc({ toAddress: req.requester_address, amount: req.amount, note: req.note, senderAddress: walletAddress, senderUsername: profile?.username, receiverUsername: req.requester_username })
      await markRequestPaid(req.id)
      refetch()
      refetchRequests()
    } catch (e) {
      console.error(e)
    } finally {
      setPayingId(null)
    }
  }

  const handleAddMoney = async () => {
    if (!walletAddress) return
    try {
      await fundWallet({ address: walletAddress, options: { chain: { id: 84532 }, asset: 'USDC' } })
      refetch()
    } catch (e) {
      console.log('fundWallet closed', e?.message)
    }
  }

  const handleQuickAction = (action) => {
    if (action.action === 'share') {
      const link = window.location.origin + '/pay/@' + (profile?.username ?? walletAddress)
      navigator.clipboard.writeText(link)
      window.dispatchEvent(new CustomEvent('verdexpay:toast', { detail: { message: 'Payment link copied!' } }))
    } else if (action.action === 'scan') {
      setScanning(true)
    } else if (action.path) {
      navigate(action.path)
    }
  }

  const p = isMobile ? '12px 16px 20px' : '32px'
  const gap = isMobile ? 20 : 32
  const cardRadius = isMobile ? 16 : 12

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA', overflowX: 'hidden', maxWidth: '100vw' }}>
      {!isMobile && <Sidebar />}

      <div style={{ marginLeft: isMobile ? 0 : 256, flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? 72 : 0, minWidth: 0, maxWidth: '100vw', overflowX: 'hidden' }}>

        {isMobile ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: '#F8F9FA', position: 'sticky', top: 0, zIndex: 10 }}>
            <div>
              <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 18, color: '#006D33' }}>VerdexPay</div>
              {profile?.username && <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#6B7280' }}>@{profile.username}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setScanning(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                <ScanIcon />
              </button>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" onClick={() => navigate('/settings')} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}/>
                : <div onClick={() => navigate('/settings')} style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'rgba(0,109,51,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: 14, color: '#006D33', cursor: 'pointer' }}>
                    {(profile?.display_name?.[0] ?? '?').toUpperCase()}
                  </div>
              }
            </div>
          </div>
        ) : (
          <Header />
        )}

        <main style={{ display: 'flex', flexDirection: 'column', gap: gap, padding: p, overflowX: 'hidden' }}>

          {/* Hero */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 0 }}>

            {/* Balance card — dark gradient on mobile, white on desktop */}
            {isMobile ? (
              <div style={{
                borderRadius: 24,
                background: 'linear-gradient(145deg, #003D1E 0%, #006D33 50%, #00A84F 100%)',
                padding: '28px 20px 24px',
                boxShadow: '0 8px 32px rgba(0,109,51,0.35)',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box',
              }}>
                {/* Subtle glow blob */}
                <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', backgroundColor: 'rgba(0,214,107,0.12)', filter: 'blur(40px)', top: -40, right: -20, pointerEvents: 'none' }}/>

                {/* Label + AUTO-YIELD badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, position: 'relative' }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em' }}>Total Balance</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', backgroundColor: 'rgba(0,214,107,0.2)', borderRadius: 9999, border: '1px solid rgba(0,214,107,0.3)' }}>
                    <TrendIcon />
                    <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#00D66B', letterSpacing: '0.06em' }}>+8.2% APY</span>
                  </div>
                </div>

                {/* Amount — split integer/decimal like reference */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 6, position: 'relative' }}>
                  {(() => {
                    const parts = displayBalance === '...' ? ['...', ''] : displayBalance.split('.')
                    const int = parts[0]
                    const dec = parts[1] ?? '00'
                    return (
                      <>
                        <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 52, lineHeight: 1, color: '#FFFFFF', opacity: loading ? 0.5 : 1 }}>${int}.</span>
                        <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 32, lineHeight: 1, color: 'rgba(255,255,255,0.55)', paddingBottom: 4 }}>{dec}</span>
                        <span style={{ fontFamily: 'Manrope', fontWeight: 600, fontSize: 16, color: 'rgba(255,255,255,0.45)', paddingBottom: 8, marginLeft: 4 }}>USDC</span>
                      </>
                    )
                  })()}
                </div>

                <div style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 28, position: 'relative' }}>
                  Earning ${balance ? ((parseFloat(balance) * 0.082) / 365).toFixed(4) : '0.0000'}/day
                </div>

                {/* 3 action buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', gap: 8 }}>
                  {[
                    {
                      label: 'Add Cash',
                      bg: 'rgba(255,255,255,0.15)',
                      icon: <svg width="18" height="18" viewBox="0 0 26 26" fill="none"><path d="M13 5V21M5 13H21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>,
                      onClick: handleAddMoney,
                    },
                    {
                      label: 'Pay',
                      bg: 'rgba(255,255,255,0.92)',
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#006D33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                      onClick: () => navigate('/send'),
                    },
                    {
                      label: 'Request',
                      bg: 'rgba(255,255,255,0.15)',
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5L5 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                      onClick: () => navigate('/send?mode=request'),
                    },
                  ].map(btn => (
                    <button key={btn.label} onClick={btn.onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <div style={{ width: '100%', maxWidth: 52, aspectRatio: '1', borderRadius: 16, backgroundColor: btn.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                        {btn.icon}
                      </div>
                      <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ── Desktop balance card ── */
              <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: cardRadius, padding: 32, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', backgroundColor: 'rgba(0,109,51,0.05)', filter: 'blur(48px)', top: -60, right: -40, pointerEvents: 'none' }}/>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: '#3C4A3D', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your balance</span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', backgroundColor: 'rgba(0,214,107,0.18)', borderRadius: 9999 }}>
                      <TrendIcon />
                      <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#005627' }}>+8.2% APY</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 48, lineHeight: 1, color: '#191C1D', opacity: loading ? 0.4 : 1 }}>${displayBalance}</span>
                    <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, color: '#3C4A3D' }}>USDC</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', backgroundColor: 'rgba(0,214,107,0.2)', borderRadius: 9999, width: 'fit-content' }}>
                    <TrendIcon />
                    <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#005627' }}>+8.2% APY • Earning ${balance ? ((parseFloat(balance) * 0.082) / 365).toFixed(2) : '0.00'}/day</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, paddingTop: 20 }}>
                    <button onClick={handleAddMoney} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 16px', background: 'linear-gradient(174deg, #006D33 0%, #00D66B 100%)', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                      <AddIcon /> Add money
                    </button>
                    <button onClick={() => navigate('/send')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 16px', backgroundColor: '#E5E2E1', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: '#656464' }}>
                      <ArrowIcon /> Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Yield teaser — slim banner on mobile, side card on desktop */}
            {isMobile ? (
              <button onClick={() => navigate('/defi')} style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#FFA478', borderRadius: 14, padding: '14px 18px', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <div style={{ width: 36, height: 36, backgroundColor: 'rgba(120,56,20,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BoltIcon />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 14, color: '#783814' }}>Earn 8.4% APY on idle USDC</div>
                  <div style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(120,56,20,0.7)', marginTop: 2 }}>Tap to enable auto-yield →</div>
                </div>
              </button>
            ) : (
              <div style={{ width: 244, backgroundColor: '#FFA478', borderRadius: cardRadius, padding: 24, border: '1px solid rgba(255,164,120,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, backgroundColor: 'rgba(120,56,20,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BoltIcon />
                  </div>
                  <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 17, color: '#783814', lineHeight: 1.3 }}>Your idle USDC could earn 8.4%</span>
                </div>
                <button onClick={() => navigate('/defi')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#783814', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: '#fff' }}>
                  Enable <ChevronIcon />
                </button>
              </div>
            )}
          </div>

          {/* Pending requests */}
          {requests.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 15, color: '#191C1D' }}>
                Payment Requests
                <span style={{ fontSize: 11, backgroundColor: '#FFA478', color: '#783814', borderRadius: 9999, padding: '2px 8px', marginLeft: 6 }}>{requests.length}</span>
              </span>
              {requests.map(req => {
                const from = req.requester_username ? '@' + req.requester_username : req.requester_address.slice(0,6) + '...' + req.requester_address.slice(-4)
                const isPaying = payingId === req.id
                return (
                  <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF4EE', borderRadius: 12, padding: '12px 16px', border: '1.5px solid rgba(196,92,0,0.15)', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 13, color: '#191C1D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {from} requested <span style={{ color: '#C45C00' }}>${parseFloat(req.amount).toFixed(2)}</span>
                      </div>
                      {req.note && <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#6B7280', marginTop: 2 }}>"{req.note}"</div>}
                    </div>
                    <button onClick={() => handlePayRequest(req)} disabled={isPaying || sendLoading}
                      style={{ padding: '8px 14px', borderRadius: 9999, border: 'none', background: 'linear-gradient(174deg, #C45C00 0%, #FFA478 100%)', color: '#fff', fontFamily: 'Manrope', fontWeight: 800, fontSize: 12, cursor: isPaying ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: isPaying ? 0.7 : 1 }}>
                      {isPaying ? '...' : 'Pay $' + parseFloat(req.amount).toFixed(2)}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Quick Actions — desktop only */}
          {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, color: '#191C1D' }}>Quick Actions</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {quickActions.map(action => (
                <button key={action.label} onClick={() => handleQuickAction(action)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '16px', backgroundColor: '#F3F4F5', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
                  <div style={{ width: 48, height: 48, backgroundColor: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    {action.icon}
                  </div>
                  <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: '#191C1D', textAlign: 'center', lineHeight: 1.3 }}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Recent Activity */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: cardRadius, padding: isMobile ? '18px 16px' : 32, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: isMobile ? 15 : 18, color: '#191C1D' }}>Recent Activity</span>
              <button onClick={() => navigate('/transactions')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: '#006D33' }}>View all</button>
            </div>
            {recentTxs.length === 0 ? (
              <div style={{ padding: '28px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>💸</div>
                <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#6B7280' }}>No transactions yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {recentTxs.map(tx => {
                  const isSender = tx.sender_address === walletAddress?.toLowerCase()
                  const cp = isSender
                    ? (tx.receiver_username ? '@' + tx.receiver_username : tx.receiver_address.slice(0,6) + '...' + tx.receiver_address.slice(-4))
                    : (tx.sender_username ? '@' + tx.sender_username : tx.sender_address.slice(0,6) + '...' + tx.sender_address.slice(-4))
                  const label = isSender ? 'Sent to ' + cp : 'Received from ' + cp
                  const date = new Date(tx.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                  return (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '50%', flexShrink: 0, backgroundColor: isSender ? 'rgba(186,26,26,0.08)' : 'rgba(0,109,51,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                          {isSender ? '↑' : '↓'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: '#191C1D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                          <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#3C4A3D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? '52vw' : 320 }}>{date}{tx.note ? ' · "' + tx.note + '"' : ''}</div>
                        </div>
                      </div>
                      <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 13, color: isSender ? '#BA1A1A' : '#006D33', flexShrink: 0 }}>
                        {isSender ? '-' : '+'}${tx.amount.toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </main>
      </div>

      {isMobile && <BottomNav />}
      {scanning && <QRScanner onScan={handleQRScan} onClose={() => setScanning(false)} />}
    </div>
  )
}
