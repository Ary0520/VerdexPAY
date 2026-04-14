import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUserProfile } from '../hooks/useUserProfile'

const Spinner = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#006D33' }}>VerdexPay</div>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(0,109,51,0.2)', borderTopColor: '#006D33', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
)

export default function AuthGuard({ children, requireUsername = true }) {
  const { ready, authenticated, walletAddress } = useAuth()

  // Only query Supabase once we have a real wallet address — prevents false redirect to /claim
  const { hasProfile, loading: profileLoading } = useUserProfile(
    authenticated && walletAddress ? walletAddress : null
  )

  // Wait for: Privy to initialise + wallet address to resolve + Supabase query to finish
  if (!ready) return <Spinner />
  if (!authenticated) return <Navigate to="/login" replace />
  if (!walletAddress || profileLoading) return <Spinner />

  // First-time user — no profile in Supabase yet
  if (requireUsername && !hasProfile) return <Navigate to="/claim" replace />

  return children
}
