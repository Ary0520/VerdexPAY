import { useState } from 'react'
import { encodeFunctionData, parseUnits, isAddress } from 'viem'
import { useSendTransaction } from '@privy-io/react-auth'
import { storeTransaction } from './useTransactions'

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS
const CHAIN_ID     = 84532

const ERC20_TRANSFER_ABI = [{
  name: 'transfer', type: 'function', stateMutability: 'nonpayable',
  inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }],
  outputs: [{ name: '', type: 'bool' }],
}]

export function useSendUsdc() {
  const { sendTransaction } = useSendTransaction()
  const [loading, setLoading] = useState(false)
  const [txHash,  setTxHash]  = useState(null)
  const [error,   setError]   = useState(null)

  // senderAddress, senderUsername, receiverUsername are passed in for storage
  const send = async ({ toAddress, amount, note, senderAddress, senderUsername, receiverUsername }) => {
    setLoading(true)
    setTxHash(null)
    setError(null)

    try {
      if (!isAddress(toAddress)) throw new Error(`Invalid address: ${toAddress}`)

      const data = encodeFunctionData({
        abi: ERC20_TRANSFER_ABI,
        functionName: 'transfer',
        args: [toAddress, parseUnits(String(amount), 6)],
      })

      const receipt = await sendTransaction(
        { to: USDC_ADDRESS, data, chainId: CHAIN_ID },
        { uiOptions: { showWalletUIs: false }, sponsor: true }
      )

      const hash = receipt?.transactionHash ?? receipt?.hash ?? receipt
      setTxHash(hash)

      // Store in Supabase — fire and forget, don't block success screen
      storeTransaction({
        senderAddress:   senderAddress ?? '',
        receiverAddress: toAddress,
        senderUsername,
        receiverUsername,
        amount,
        note,
        txHash: hash,
      })

      return hash
    } catch (e) {
      const msg = e?.shortMessage ?? e?.details ?? e?.message ?? 'Transaction failed'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { send, loading, txHash, error }
}
