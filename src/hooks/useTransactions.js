import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Store a completed send
export async function storeTransaction({ senderAddress, receiverAddress, senderUsername, receiverUsername, amount, note, txHash }) {
  const { error } = await supabase.from('transactions').insert({
    sender_address:   senderAddress.toLowerCase(),
    receiver_address: receiverAddress.toLowerCase(),
    sender_username:  senderUsername  ?? null,
    receiver_username: receiverUsername ?? null,
    amount:           parseFloat(amount),
    note:             note || null,
    tx_hash:          txHash,
  })
  if (error) console.error('[storeTransaction] error:', error)
}

// Fetch all transactions where user is sender or receiver
export function useTransactions(walletAddress) {
  const [txs,     setTxs]     = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!walletAddress) return
    setLoading(true)
    const addr = walletAddress.toLowerCase()
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .or(`sender_address.eq.${addr},receiver_address.eq.${addr}`)
      .order('created_at', { ascending: false })
    setTxs(data ?? [])
    setLoading(false)
  }, [walletAddress])

  useEffect(() => { fetch() }, [fetch])

  return { txs, loading, refetch: fetch }
}
