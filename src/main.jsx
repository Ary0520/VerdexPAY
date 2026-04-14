import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivyProvider } from '@privy-io/react-auth'
import { AuthProvider } from './context/AuthContext'
import AuthGuard from './components/AuthGuard'
import Toast from './components/Toast'
import AppNotifications from './components/AppNotifications'
import Login from './pages/Login'
import ClaimUsername from './pages/ClaimUsername'
import Dashboard from './pages/Dashboard'
import Send from './pages/Send'
import Yield from './pages/Yield'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'
import Pay from './pages/Pay'
import './index.css'

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#006D33',
        },
        loginMethods: ['google', 'email'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
          showWalletUIs: false, // suppress "Approve transfer" modal — we handle UX ourselves
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <AppNotifications />
          <Toast />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/claim" element={<ClaimUsername />} />
            <Route path="/pay/:handle" element={<Pay />} />

            {/* Protected */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/send"      element={<AuthGuard><Send /></AuthGuard>} />
            <Route path="/defi"         element={<AuthGuard><Yield /></AuthGuard>} />
        <Route path="/transactions" element={<AuthGuard><Transactions /></AuthGuard>} />
        <Route path="/settings"     element={<AuthGuard><Settings /></AuthGuard>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </PrivyProvider>
  </React.StrictMode>
)
