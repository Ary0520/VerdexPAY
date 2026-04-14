import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="3.5" width="16" height="11" rx="2" stroke="#3C4A3D" strokeWidth="1.4"/>
    <path d="M1 6L9 10.5L17 6" stroke="#3C4A3D" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1L2 3.5V7C2 9.985 4.24 12.785 7 13.5C9.76 12.785 12 9.985 12 7V3.5L7 1Z" stroke="#006D33" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M4.5 7L6.5 9L9.5 5.5" stroke="#006D33" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Login() {
  const { authenticated, ready, login } = useAuth()

  if (!ready) return <LoadingScreen />
  if (authenticated) {
    const redirect = sessionStorage.getItem('pay_redirect')
    if (redirect) { sessionStorage.removeItem('pay_redirect'); return <Navigate to={redirect} replace /> }
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,214,107,0.12) 0%, transparent 70%)', top: -120, right: -80 }}/>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,109,51,0.08) 0%, transparent 70%)', bottom: -80, left: -60 }}/>
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 32, color: '#006D33', letterSpacing: '-0.02em' }}>
            VerdexPay
          </div>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3C4A3D', opacity: 0.6, marginTop: 4 }}>
            INSTITUTIONAL GRADE
          </div>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
        }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#191C1D', marginBottom: 8, textAlign: 'center' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32, lineHeight: 1.5 }}>
            Sign in to access your wallet, send money, and earn yield on idle balances.
          </p>

          {/* Login button — triggers Privy modal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={login}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '14px 24px', borderRadius: 12,
                background: 'linear-gradient(135deg, #006D33 0%, #00D66B 100%)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 15, color: '#fff',
                boxShadow: '0 4px 20px rgba(0,109,51,0.28)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,109,51,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,109,51,0.28)' }}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <button
              onClick={login}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '14px 24px', borderRadius: 12,
                backgroundColor: '#fff', border: '1.5px solid #E5E2E1',
                cursor: 'pointer',
                fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, color: '#191C1D',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#006D33'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,109,51,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E2E1'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <EmailIcon />
              Continue with Email
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 28, flexWrap: 'wrap' }}>
            {[
              'No seed phrases',
              'Gas sponsored',
              'Non-custodial',
            ].map(label => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldIcon />
                <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#006D33', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 20, lineHeight: 1.6 }}>
          By continuing you agree to our Terms of Service.<br/>
          Your wallet is created automatically — no crypto knowledge needed.
        </p>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#006D33' }}>VerdexPay</div>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(0,109,51,0.2)', borderTopColor: '#006D33', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
