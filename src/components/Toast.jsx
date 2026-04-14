import React, { useState, useEffect } from 'react'

export default function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now()
      setToasts(t => [...t, { id, ...e.detail }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500)
    }
    window.addEventListener('verdexpay:toast', handler)
    return () => window.removeEventListener('verdexpay:toast', handler)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 18px', borderRadius: 14,
          backgroundColor: '#1C1C1E', color: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          maxWidth: 340, animation: 'slideUp 0.3s ease',
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>💸</span>
          <div>
            <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 13, color: '#fff' }}>Payment received</div>
            <div style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2, lineHeight: 1.4 }}>{t.message}</div>
          </div>
          <button onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 16, padding: 0, flexShrink: 0, lineHeight: 1 }}>✕</button>
        </div>
      ))}
      <style>{`@keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  )
}
