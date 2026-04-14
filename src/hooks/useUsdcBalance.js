import { useState, useEffect, useCallback } from 'react'
import { publicClient } from '../lib/viemClient'

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS

// Minimal ERC-20 ABI — only what we need
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
]

export function useUsdcBalance(address, tokenAddress) {
  const [balance, setBalance]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const contractAddress = tokenAddress ?? USDC_ADDRESS

  const fetch = useCallback(async () => {
    if (!address) return
    setLoading(true)
    setError(null)
    try {
      const raw = await publicClient.readContract({
        address: contractAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      })
      const formatted = (Number(raw) / 1_000_000).toFixed(2)
      setBalance(formatted)
    } catch (e) {
      setError(e.message)
      setBalance('0.00')
    } finally {
      setLoading(false)
    }
  }, [address, contractAddress])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { balance, loading, error, refetch: fetch }
}
