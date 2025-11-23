'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { checkVVSTokensMetadata } from '@/lib/api/vvs-tokens-api'
import { motion } from 'framer-motion'

// Force dynamic rendering to avoid Firebase auth errors during build
export const dynamic = 'force-dynamic';

export default function VVSTokensAdminPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [needsUpdate, setNeedsUpdate] = useState(false)
  const [importStatus, setImportStatus] = useState('')
  
  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/')
      return
    }
    
    checkUpdateStatus()
  }, [user, isAdmin, router])
  
  const checkUpdateStatus = async () => {
    try {
      const metadata = await checkVVSTokensMetadata()
      setLastUpdate(metadata.lastUpdated)
      // Consider update needed if older than 24 hours
      const needsUpdate = !metadata.lastUpdated || 
        (Date.now() - metadata.lastUpdated.getTime() > 24 * 60 * 60 * 1000)
      setNeedsUpdate(needsUpdate)
    } catch (error) {
      console.error('Error checking update status:', error)
    }
  }
  
  const handleImportTokens = async () => {
    setLoading(true)
    setImportStatus('Starting VVS token import...')
    
    try {
      // Call your backend API to trigger the import
      const response = await fetch('/api/admin/import-vvs-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to import tokens')
      }
      
      const result = await response.json()
      setImportStatus(`Successfully imported ${result.tokenCount} tokens!`)
      
      // Refresh status
      await checkUpdateStatus()
    } catch (error) {
      console.error('Error importing tokens:', error)
      setImportStatus('Error importing tokens. Check console for details.')
    } finally {
      setLoading(false)
    }
  }
  
  if (!user || !isAdmin) {
    return null
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-white mb-8">VVS Token Management</h1>
          
          <div className="bg-[#0a0f1f]/80 backdrop-blur-xl rounded-2xl border border-[#1a2c4c]/50 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Token Database Status</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Updated:</span>
                <span className="text-white">
                  {lastUpdate ? lastUpdate.toLocaleString() : 'Never'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Update Needed:</span>
                <span className={needsUpdate ? 'text-yellow-400' : 'text-green-400'}>
                  {needsUpdate ? 'Yes (older than 24 hours)' : 'No'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#0a0f1f]/80 backdrop-blur-xl rounded-2xl border border-[#1a2c4c]/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Import VVS Tokens</h2>
            
            <p className="text-gray-400 mb-6">
              This will fetch all tokens from VVS Finance API and store them in Firebase for better performance.
              The process may take a few minutes.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={handleImportTokens}
                disabled={loading}
                isLoading={loading}
                variant="primary"
                size="lg"
              >
                {loading ? 'Importing Tokens...' : 'Import VVS Tokens'}
              </Button>
              
              {importStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg ${
                    importStatus.includes('Success') 
                      ? 'bg-green-900/20 border border-green-800/50 text-green-400'
                      : importStatus.includes('Error')
                      ? 'bg-red-900/20 border border-red-800/50 text-red-400'
                      : 'bg-blue-900/20 border border-blue-800/50 text-blue-400'
                  }`}
                >
                  {importStatus}
                </motion.div>
              )}
            </div>
            
            <div className="mt-8 p-4 bg-[#162234]/50 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">How it works:</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Fetches all tokens from VVS Finance API</li>
                <li>• Stores token data in Firebase for fast access</li>
                <li>• Includes token logos from trusted sources</li>
                <li>• Updates prices and metadata</li>
                <li>• Automatically deduplicates tokens</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  )
}