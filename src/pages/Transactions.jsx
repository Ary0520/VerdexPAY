import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { useTransactions } from '../hooks/useTransactions'
import { useIsMobile } from '../hooks/useIsMobile'

function TxRow({ tx, walletAddress, isMobile }) {
  const isSender = tx.sender_address === walletAddress.toLowerCase()
  const counterparty = isSender
    ? (tx.receiver_username ? `@${tx.receiver_username}` : tx.receiver_address.slice(0,6)+'...'+tx.receiver_address.slice(-4))
    : (tx.sender_username  ? `@${tx.sender_username}`  : tx.sender_address.slice(0,6)+'...'+tx.sender_address.slice(-4))

  const label = isSender ? `You sent to ${counterparty}` : `${counterparty} sent you`
  const date  = new Date(tx.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '14px 0' : '16px 0', borderBottom: '1px solid #F3F4F5', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 14, minWidth: 0 }}>
        <div style={{ width: isMobile ? 40 : 44, height: isMobile ? 40 : 44, borderRadius: '50%', flexShrink: 0, backgroundColor: isSender ? 'rgba(186,26,26,0.08)' : 'rgba(0,109,51,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          {isSender ? '↑' : '↓'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: isMobile ? 13 : 14, color: '#191C1D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
          <div style={{ fontFamily: 'Inter', fontSize: isMobile ? 11 : 12, color: '#6B7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {date}{tx.note ? ` · "${tx.note}"` : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
        <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: isMobile ? 13 : 15, color: isSender ? '#BA1A1A' : '#006D33' }}>
          {isSender ? '-' : '+'}${tx.amount.toFixed(2)}
        </span>
        <a href={`https://sepolia.basescan.org/tx/${tx.tx_hash}`} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: 'Inter', fontSize: 10, color: '#006D33', textDecoration: 'none' }}>
          View ↗
        </a>
      </div>
    </div>
  )
}

export default function Transactions() {
  const { walletAddress } = useAuth()
  const { txs, loading } = useTransactions(walletAddress)
  const isMobile = useIsMobile()
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? txs.filter(tx => {
        const q = query.toLowerCase()
        return (
          tx.sender_username?.toLowerCase().includes(q) ||
          tx.receiver_username?.toLowerCase().includes(q) ||
          tx.sender_address?.toLowerCase().includes(q) ||
          tx.receiver_address?.toLowerCase().includes(q) ||
          tx.note?.toLowerCase().includes(q) ||
          tx.amount?.toString().includes(q)
        )
      })
    : txs

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA', overflowX: 'hidden' }}>
      {!isMobile && <Sidebar />}

      <div style={{ marginLeft: isMobile ? 0 : 256, flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? 72 : 0, minWidth: 0 }}>

        {isMobile ? (
          <div style={{ backgroundColor: '#F8F9FA', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #E5E2E1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 12px' }}>
              <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke="#191C1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 17, color: '#191C1D' }}>History</span>
            </div>
            {/* Mobile search */}
            <div style={{ position: 'relative', padding: '0 16px 12px' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="6" cy="6" r="4.5" stroke="#6B7280" strokeWidth="1.3"/>
                <path d="M10 10L12.5 12.5" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, note, amount..."
                style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: '#F3F4F5', border: '1.5px solid transparent', borderRadius: 10, fontFamily: 'Inter', fontSize: 13, color: '#191C1D', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#006D33'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>
          </div>
        ) : <Header />}

        <main style={{ padding: isMobile ? '16px 16px 24px' : '40px 40px 60px' }}>

          {!isMobile && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 26, color: '#191C1D', marginBottom: 4 }}>Transactions</h1>
                  <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#6B7280' }}>Your full send & receive history</p>
                </div>
                {/* Desktop search */}
                <div style={{ position: 'relative', width: 280 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <circle cx="6" cy="6" r="4.5" stroke="#6B7280" strokeWidth="1.3"/>
                    <path d="M10 10L12.5 12.5" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search transactions..."
                    style={{ width: '100%', padding: '10px 14px 10px 36px', backgroundColor: '#F3F4F5', border: '1.5px solid transparent', borderRadius: 10, fontFamily: 'Inter', fontSize: 13, color: '#191C1D', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#006D33'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: isMobile ? 16 : 16, padding: isMobile ? '4px 16px' : '8px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {loading ? (
              <div style={{ padding: '48px 0', textAlign: 'center', fontFamily: 'Inter', fontSize: 14, color: '#6B7280' }}>
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '64px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{query ? '🔍' : '💸'}</div>
                <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: '#191C1D', marginBottom: 6 }}>
                  {query ? 'No results found' : 'No transactions yet'}
                </div>
                <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#6B7280' }}>
                  {query ? `Nothing matched "${query}"` : 'Send your first payment to see it here'}
                </div>
              </div>
            ) : (
              filtered.map(tx => <TxRow key={tx.id} tx={tx} walletAddress={walletAddress} isMobile={isMobile} />)
            )}
          </div>

        </main>
      </div>

      {isMobile && <BottomNav />}
    </div>
  )
}
