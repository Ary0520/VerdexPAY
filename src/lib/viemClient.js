import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { baseSepolia } from 'viem/chains'

const RPC_URL = import.meta.env.VITE_RPC_URL

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
})

export function createAppWalletClient(provider) {
  return createWalletClient({
    chain: baseSepolia,
    transport: custom(provider),
  })
}

export { baseSepolia }
