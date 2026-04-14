import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Store a new payment request
export async function createPaymentRequest({ requesterAddress, requesterUsername, payerAddress, payerUsername, amount, note }) {
  const { data, error } = await supabase
    .from('payment_requests')
    .insert({
      requester_address:  requesterAddress.toLowerCase(),
      requester_username: requesterUsername ?? null,
      payer_address:      payerAddress.toLowerCase(),
      payer_username:     payerUsername ?? null,
      amount:             parseFloat(amount),
      note:               note || null,
      status:             'pending',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// Mark a request as paid
export async function markRequestPaid(id) {
  const { error } = await supabase
    .from('payment_requests')
    .update({ status: 'paid' })
    .eq('id', id)
  if (error) throw error
}

// Fetch pending requests where I am the payer (someone is asking me to pay)
export function usePendingRequests(walletAddress) {
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)

  const fetch = useCallback(async () => {
    if (!walletAddress) return
    setLoading(true)
    const { data } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('payer_address', walletAddress.toLowerCase())
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
    setLoading(false)
  }, [walletAddress])

  useEffect(() => { fetch() }, [fetch])

  // Realtime — new request arrives
  useEffect(() => {
    if (!walletAddress) return
    const channel = supabase
      .channel(`requests:${walletAddress.toLowerCase()}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'payment_requests',
        filter: `payer_address=eq.${walletAddress.toLowerCase()}`,
      }, () => fetch())
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'payment_requests',
        filter: `payer_address=eq.${walletAddress.toLowerCase()}`,
      }, () => fetch())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [walletAddress, fetch])

  return { requests, loading, refetch: fetch }
}
