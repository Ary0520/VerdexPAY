import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Shows a browser notification + in-app toast
export function usePaymentNotifications(walletAddress, notificationsEnabled) {
  const seenIds = useRef(new Set())

  useEffect(() => {
    if (!walletAddress || !notificationsEnabled) return
    if (Notification.permission !== 'granted') return

    const addr = walletAddress.toLowerCase()

    // Subscribe to new rows in transactions where this user is the receiver
    const channel = supabase
      .channel(`payments:${addr}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'transactions',
          filter: `receiver_address=eq.${addr}`,
        },
        (payload) => {
          const tx = payload.new
          if (seenIds.current.has(tx.id)) return
          seenIds.current.add(tx.id)

          const sender = tx.sender_username ? `@${tx.sender_username}` : tx.sender_address.slice(0,6)+'...'+tx.sender_address.slice(-4)
          const body   = `${sender} sent you $${parseFloat(tx.amount).toFixed(2)} USDC${tx.note ? ` · "${tx.note}"` : ''}`

          // Browser notification
          new Notification('💸 Payment received — VerdexPay', {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
          })

          // In-app toast via custom event
          window.dispatchEvent(new CustomEvent('verdexpay:toast', {
            detail: { type: 'received', message: body }
          }))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [walletAddress, notificationsEnabled])
}
