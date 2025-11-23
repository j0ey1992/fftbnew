import { useState, useEffect } from 'react'
import { getCroBalance, getTokenBalance } from '@/lib/vvs/vvs-service'

interface UseTokenBalanceParams {
  address: string
  token?: string
  chainId?: number
  enabled?: boolean
}

export const useTokenBalance = ({ address, token, enabled = true }: UseTokenBalanceParams) => {
  const [data, setData] = useState<bigint | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!address || !token || !enabled) {
      setData(null)
      return
    }

    const fetchBalance = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Special handling for CRO (native token)
        const balanceString = token.toLowerCase() === 'cro' || token === '0x0000000000000000000000000000000000000000'
          ? await getCroBalance(address)
          : await getTokenBalance(token, address)
        
        // Convert string balance to bigint (assuming 18 decimals)
        const balance = BigInt(Math.floor(parseFloat(balanceString) * 1e18))
        setData(balance)
      } catch (err) {
        console.error('Error fetching token balance:', err)
        setError(err as Error)
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
  }, [address, token, enabled])

  return { data, isLoading, error }
}