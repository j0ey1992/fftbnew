'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { useAppKitAccount } from '@reown/appkit/react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { firestoreDB } from '@/lib/firebase/config'

interface DeployedContract {
  id: string
  contractType: string
  contractAddress: string
  parameters: Record<string, any>
  chainId: number
  createdAt: string
}

export function UserDeployedContracts() {
  const [contracts, setContracts] = useState<DeployedContract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { address, isConnected } = useAppKitAccount()
  
  // Fetch user's deployed contracts
  useEffect(() => {
    const fetchContracts = async () => {
      if (!isConnected || !address) {
        setContracts([])
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch contracts from all collections directly from Firebase
        const collections = ['user-deployed-contracts', 'user-tokenvault-contracts', 'user-smartchef-contracts', 'user-nftstaking-contracts']
        let allContracts: DeployedContract[] = []
        
        for (const collectionName of collections) {
          try {
            const contractsRef = collection(firestoreDB, collectionName)
            const q = query(
              contractsRef,
              where('ownerAddress', '==', address.toLowerCase()),
              orderBy('createdAt', 'desc')
            )
            
            const snapshot = await getDocs(q)
            const contractsFromCollection = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as DeployedContract))
            
            allContracts = [...allContracts, ...contractsFromCollection]
          } catch (error) {
            // Collection might not exist, continue to next one
            console.log(`Collection ${collectionName} not found or empty`)
          }
        }
        
        // Sort by creation date (newest first)
        allContracts.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
          return dateB.getTime() - dateA.getTime()
        })
        
        setContracts(allContracts)
      } catch (error) {
        console.error('Error fetching contracts:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch contracts')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContracts()
  }, [address, isConnected])
  
  // Format contract type for display
  const formatContractType = (type: string): string => {
    if (type.includes('erc20-token')) return 'ERC20 Token'
    if (type.includes('erc20-tax')) return 'Tax Token'
    if (type.includes('lp-staking')) return 'LP Staking'
    if (type.includes('token-staking')) return 'Token Staking'
    if (type.includes('nft-staking')) return 'NFT Staking'
    if (type.includes('token-vault')) return 'Token Vault'
    if (type.includes('deploy-nft')) return 'NFT Collection'
    if (type.includes('erc404')) return 'ERC404 Token'
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Open contract on block explorer
  const openOnExplorer = (contractAddress: string, chainId: number) => {
    let explorerUrl = 'https://cronoscan.com/address/'
    
    // Use different explorer based on chain ID
    if (chainId === 1) {
      explorerUrl = 'https://etherscan.io/address/'
    } else if (chainId === 56) {
      explorerUrl = 'https://bscscan.com/address/'
    } else if (chainId === 137) {
      explorerUrl = 'https://polygonscan.com/address/'
    } else if (chainId === 43114) {
      explorerUrl = 'https://snowtrace.io/address/'
    }
    
    window.open(`${explorerUrl}${contractAddress}`, '_blank')
  }
  
  // Copy contract address to clipboard
  const copyAddress = (contractAddress: string) => {
    navigator.clipboard.writeText(contractAddress)
    // Could add a toast notification here
  }
  
  if (!isConnected) {
    return (
      <GlassCard className="p-6 text-center">
        <h3 className="text-xl font-semibold mb-4">Your Deployed Contracts</h3>
        <p className="text-gray-300 mb-4">Connect your wallet to view your deployed contracts.</p>
        <Button variant="primary" onClick={() => {}}>Connect Wallet</Button>
      </GlassCard>
    )
  }
  
  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">Your Deployed Contracts</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-red-400 mb-4">{error}</p>
          <Button variant="glass" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-300 mb-4">You haven't deployed any contracts yet.</p>
          <Button variant="primary" onClick={() => {}}>Deploy Your First Contract</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract, index) => (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <GlassCard className="p-4" variant="dark">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <h4 className="font-semibold text-white">
                        {formatContractType(contract.contractType)}
                      </h4>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2">
                      {contract.parameters.name || contract.parameters.tokenName || 'Unnamed Contract'}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-400">
                      <span className="mr-2">Deployed:</span>
                      <span>{formatDate(contract.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                    <div className="flex-1 flex items-center">
                      <div className="text-xs bg-gray-800 rounded-lg px-2 py-1 font-mono text-gray-300 truncate max-w-[120px] sm:max-w-[160px]">
                        {contract.contractAddress.slice(0, 6)}...{contract.contractAddress.slice(-4)}
                      </div>
                      <Button
                        variant="glass"
                        size="sm"
                        className="ml-2 p-1 h-6 w-6"
                        onClick={() => copyAddress(contract.contractAddress)}
                        icon={
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        }
                      >
                        <span className="sr-only">Copy Address</span>
                      </Button>
                    </div>
                    
                    <Button
                      variant="glass"
                      size="sm"
                      className="text-xs"
                      onClick={() => openOnExplorer(contract.contractAddress, contract.chainId)}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      }
                    >
                      View
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
