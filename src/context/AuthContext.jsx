import React, { createContext, useContext } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()

  // useWallets is the reliable source — finds the Privy embedded wallet
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy')
  const walletAddress = embeddedWallet?.address ?? null

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null

  const displayName =
    user?.google?.name ??
    user?.email?.address ??
    user?.phone?.number ??
    shortAddress ??
    'User'

  const avatarUrl = user?.google?.picture ?? null

  return (
    <AuthContext.Provider value={{
      ready,
      authenticated,
      user,
      login,
      logout,
      walletAddress,
      shortAddress,
      displayName,
      avatarUrl,
      embeddedWallet, // expose the full wallet object for sendTransaction etc.
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
