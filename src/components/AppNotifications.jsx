import { useAuth } from '../context/AuthContext'
import { useUserProfile } from '../hooks/useUserProfile'
import { usePaymentNotifications } from '../hooks/usePaymentNotifications'

export default function AppNotifications() {
  const { walletAddress } = useAuth()
  const { profile } = useUserProfile(walletAddress)
  usePaymentNotifications(walletAddress, profile?.notifications_enabled ?? false)
  return null
}
