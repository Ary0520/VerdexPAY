import { useState } from 'react'
import { encodeFunctionData, parseUnits, maxUint256 } from 'viem'
import { useSendTransaction } from '@privy-io/react-auth'
import { publicClient } from '../lib/viemClient'

// ── Aave V3 Base Sepolia addresses (from bgd-labs/aave-address-book) ───────
export const AAVE_POOL   = import.meta.env.VITE_AAVE_POOL
export const AAVE_USDC   = import.meta.env.VITE_USDC_ADDRESS
export const AAVE_A_USDC = import.meta.env.VITE_AAVE_A_USDC
const CHAIN_ID = 84532

// ── Minimal ABIs ────────────────────────────────────────────────────────────
const ERC20_ABI = [
  { name: 'approve',   type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view',       inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view',       inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
]

const POOL_ABI = [
  { name: 'supply',   type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'asset', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'onBehalfOf', type: 'address' }, { name: 'referralCode', type: 'uint16' }], outputs: [] },
  { name: 'withdraw', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'asset', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'to', type: 'address' }], outputs: [{ type: 'uint256' }] },
]

// ── Read aUSDC balance (= amount supplied to Aave) ─────────────────────────
export async function getAUsdcBalance(address) {
  try {
    const raw = await publicClient.readContract({
      address: AAVE_A_USDC,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    })
    return parseFloat((Number(raw) / 1_000_000).toFixed(6))
  } catch { return 0 }
}

// ── Read current USDC allowance for Pool ──────────────────────────────────
export async function getUsdcAllowance(owner) {
  try {
    const raw = await publicClient.readContract({
      address: AAVE_USDC,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner, AAVE_POOL],
    })
    return Number(raw)
  } catch { return 0 }
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useAaveYield() {
  const { sendTransaction } = useSendTransaction()
  const [loading,  setLoading]  = useState(false)
  const [step,     setStep]     = useState(null) // 'approving' | 'supplying' | 'withdrawing'
  const [error,    setError]    = useState(null)

  const sendTx = async (to, data) => {
    const receipt = await sendTransaction(
      { to, data, chainId: CHAIN_ID },
      { uiOptions: { showWalletUIs: false }, sponsor: true }
    )
    return receipt?.transactionHash ?? receipt?.hash ?? receipt
  }

  // Supply: approve (if needed) → supply
  const supply = async ({ walletAddress, amount }) => {
    setLoading(true)
    setError(null)
    try {
      const amountUnits = parseUnits(String(amount), 6)

      // 1. Check existing allowance
      const allowance = await getUsdcAllowance(walletAddress)

      if (allowance < Number(amountUnits)) {
        setStep('approving')
        // Approve max so user never has to approve again
        const approveData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [AAVE_POOL, maxUint256],
        })
        await sendTx(AAVE_USDC, approveData)
      }

      // 2. Supply to Aave
      setStep('supplying')
      const supplyData = encodeFunctionData({
        abi: POOL_ABI,
        functionName: 'supply',
        args: [AAVE_USDC, amountUnits, walletAddress, 0],
      })
      const hash = await sendTx(AAVE_POOL, supplyData)
      return hash
    } catch (e) {
      const msg = e?.shortMessage ?? e?.details ?? e?.message ?? 'Supply failed'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
      setStep(null)
    }
  }

  // Withdraw: pass amount or 'max' to withdraw everything
  const withdraw = async ({ walletAddress, amount }) => {
    setLoading(true)
    setError(null)
    try {
      setStep('withdrawing')
      // maxUint256 = withdraw entire aUSDC balance
      const amountUnits = amount === 'max' ? maxUint256 : parseUnits(String(amount), 6)

      const withdrawData = encodeFunctionData({
        abi: POOL_ABI,
        functionName: 'withdraw',
        args: [AAVE_USDC, amountUnits, walletAddress],
      })
      const hash = await sendTx(AAVE_POOL, withdrawData)
      return hash
    } catch (e) {
      const msg = e?.shortMessage ?? e?.details ?? e?.message ?? 'Withdraw failed'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
      setStep(null)
    }
  }

  const stepLabel = {
    approving:  'Approving USDC...',
    supplying:  'Supplying to Aave...',
    withdrawing: 'Withdrawing...',
  }

  return { supply, withdraw, loading, step, stepLabel: stepLabel[step] ?? null, error }
}
