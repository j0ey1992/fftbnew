'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { useAppKitAccount } from '@reown/appkit/react'
import { getAppKit } from '@/lib/reown/init'

export function DeploymentTester() {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [contractType, setContractType] = useState('erc20-token')
  
  const { address, isConnected } = useAppKitAccount()
  
  // Connect wallet
  const connect = async () => {
    const appKit = getAppKit()
    if (appKit && appKit.connect) {
      try {
        await appKit.connect()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        setError('Failed to connect wallet. Please try again.')
      }
    }
  }
  
  // Test contract deployment
  const testDeployment = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }
    
    setIsDeploying(true)
    setError(null)
    
    try {
      // Ensure wallet is fully connected before proceeding
      const appKit = getAppKit()
      if (!appKit) {
        throw new Error('AppKit not initialized')
      }
      
      // Double-check account is available
      const account = await appKit.getAccount?.()
      if (!account || !account.address) {
        // Try to reconnect
        await connect()
        
        // Check again after reconnection attempt
        const reconnectedAccount = await appKit.getAccount?.()
        if (!reconnectedAccount || !reconnectedAccount.address) {
          throw new Error('Unable to detect your connected wallet. Please try connecting again or refresh the page.')
        }
      }
      
      // Import the deployContract function dynamically
      const { deployContract, saveDeployedContract } = await import('@/lib/contracts/deploy-contract')
      
      // Sample parameters for testing
      const parameters = {
        name: 'Test Token',
        symbol: 'TEST',
        totalSupply: '1000000',
        decimals: 18
      }
      
      // Deploy the contract
      const result = await deployContract({
        contractType,
        parameters
      })
      
      if (!result.success || !result.contractAddress) {
        throw new Error(result.error || 'Failed to deploy contract')
      }
      
      // Save the deployed contract to Firebase
      await saveDeployedContract(
        contractType,
        result.contractAddress,
        parameters,
        [] // ABI will be fetched from the contract
      )
      
      setDeployedAddress(result.contractAddress)
    } catch (error) {
      console.error('Error deploying contract:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsDeploying(false)
    }
  }
  
  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">Contract Deployment Tester</h3>
      
      {!isConnected ? (
        <div className="text-center py-6">
          <p className="text-gray-300 mb-4">Connect your wallet to test contract deployment.</p>
          <Button variant="primary" onClick={connect}>Connect Wallet</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <p className="text-sm text-gray-300">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm text-gray-300">Contract Type</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
            >
              <option value="erc20-token">ERC20 Token</option>
              <option value="erc20-tax-token">Tax Token</option>
              <option value="lp-staking">LP Staking</option>
              <option value="token-vault">Token Vault</option>
              <option value="deploy-nft">NFT Collection</option>
            </select>
          </div>
          
          <Button
            variant="primary"
            onClick={testDeployment}
            disabled={isDeploying}
            className="w-full"
          >
            {isDeploying ? 'Deploying...' : 'Test Deployment'}
          </Button>
          
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          
          {deployedAddress && (
            <div className="bg-green-900/30 border border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-300 mb-2">Contract deployed successfully!</p>
              <div className="flex items-center">
                <span className="text-xs text-gray-300 mr-2">Address:</span>
                <code className="text-xs bg-gray-800 rounded-lg px-2 py-1 font-mono text-gray-300">
                  {deployedAddress}
                </code>
                <Button
                  variant="glass"
                  size="sm"
                  className="ml-2 p-1 h-6 w-6"
                  onClick={() => navigator.clipboard.writeText(deployedAddress)}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  <span className="sr-only">Copy Address</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  )
}
