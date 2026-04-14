import React, { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

// ── Show QR modal ──────────────────────────────────────────────────────────
// Shows a QR code for a given URL (payment link or wallet address)
export function QRShowModal({ url, title, subtitle, onClose }) {
  const svgRef = useRef(null)

  const handleDownload = () => {
    const svg = svgRef.current?.querySelector('svg')
    if (!svg) return
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'verdexpay-qr.svg'
    a.click()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: '#fff', borderRadius: 20, padding: 36, width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 20, color: '#191C1D' }}>{title}</div>
          {subtitle && <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#6B7280', marginTop: 4 }}>{subtitle}</div>}
        </div>

        {/* QR code */}
        <div ref={svgRef} style={{ padding: 16, backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #E5E2E1' }}>
          <QRCodeSVG
            value={url}
            size={220}
            bgColor="#ffffff"
            fgColor="#191C1D"
            level="M"
            includeMargin={false}
          />
        </div>

        {/* URL preview */}
        <div style={{ width: '100%', padding: '10px 14px', backgroundColor: '#F3F4F5', borderRadius: 10, fontFamily: 'Inter', fontSize: 11, color: '#6B7280', wordBreak: 'break-all', textAlign: 'center' }}>
          {url}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={handleCopy} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #006D33', backgroundColor: 'transparent', fontFamily: 'Manrope', fontWeight: 700, fontSize: 13, color: '#006D33', cursor: 'pointer' }}>
            Copy link
          </button>
          <button onClick={handleDownload} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #006D33 0%, #00D66B 100%)', fontFamily: 'Manrope', fontWeight: 700, fontSize: 13, color: '#fff', cursor: 'pointer' }}>
            Save QR
          </button>
        </div>

        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: 13, color: '#9CA3AF' }}>
          Close
        </button>
      </div>
    </div>
  )
}
