import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

// Scans a QR code using the device camera
// onScan(result) — called with the decoded string
// Handles: payment links (/pay/@handle), wallet addresses (0x...), @handles
export function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null)
  const [error, setError] = useState(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      (decodedText) => {
        scanner.stop().catch(() => {})
        onScan(decodedText)
      },
      () => {} // ignore per-frame errors
    ).then(() => setStarted(true))
     .catch(err => setError('Camera access denied. Please allow camera permissions.'))

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [])

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 18, color: '#fff' }}>Scan QR Code</div>
        <div style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Point at a VerdexPay QR code</div>

        {/* Scanner viewport */}
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(0,214,107,0.6)' }}>
          <div id="qr-reader" style={{ width: 300, height: 300 }} />
          {/* Corner guides */}
          {['tl','tr','bl','br'].map(pos => (
            <div key={pos} style={{
              position: 'absolute',
              width: 24, height: 24,
              borderColor: '#00D66B',
              borderStyle: 'solid',
              borderWidth: pos.includes('t') ? '3px 0 0 0' : '0 0 3px 0',
              ...(pos.includes('l') ? { left: 12, borderLeftWidth: 3 } : { right: 12, borderRightWidth: 3 }),
              ...(pos.includes('t') ? { top: 12 } : { bottom: 12 }),
            }}/>
          ))}
        </div>

        {error && (
          <div style={{ padding: '10px 16px', backgroundColor: 'rgba(186,26,26,0.2)', borderRadius: 10, fontFamily: 'Inter', fontSize: 13, color: '#ff6b6b', maxWidth: 300, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <button onClick={onClose} style={{ padding: '12px 32px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.3)', backgroundColor: 'transparent', fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// Parse a scanned QR string into { handle, amount, note } or { address }
export function parseQRResult(raw) {
  try {
    // Full URL: https://app.com/pay/@aryan or https://app.com/pay/@aryan/5?note=Coffee
    if (raw.startsWith('http')) {
      const url = new URL(raw)
      const parts = url.pathname.split('/').filter(Boolean) // ['pay', '@aryan', '5']
      if (parts[0] === 'pay' && parts[1]) {
        return {
          type: 'handle',
          handle: parts[1], // @aryan
          amount: parts[2] ?? '',
          note: url.searchParams.get('note') ?? '',
        }
      }
    }
    // Raw @handle
    if (raw.startsWith('@') || /^[a-z0-9_]{3,20}$/.test(raw)) {
      return { type: 'handle', handle: raw, amount: '', note: '' }
    }
    // Raw 0x address
    if (/^0x[0-9a-fA-F]{40}$/.test(raw)) {
      return { type: 'address', address: raw }
    }
  } catch {}
  return null
}
