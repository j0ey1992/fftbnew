'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { firestoreDB } from '@/lib/firebase/config'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore'
import { useAuth } from '@/components/providers/auth/AuthProvider'
import AdminRoute from '@/components/providers/auth/AdminRoute'

// Force dynamic rendering to avoid Firebase auth errors during build
export const dynamic = 'force-dynamic';

interface DeployedContract {
  id: string
  templateId: string
  contractAddress: string
  chainId: number
  ownerAddress: string
  parameters: Record<string, any>
  projectName: string
  description: string
  socialLinks: Record<string, string>
  collections: Array<{
    id: string
    name: string
    address: string
    ratio: number
    description: string
  }>
  status: 'pending' | 'approved' | 'rejected'
  createdAt: any
  updatedAt: any
  transactionHash: string
  metadata?: {
    deployedVia: string
    version: string
  }
  images?: {
    logoUrl?: string
    bannerUrl?: string
  }
  adminNotes?: string
}

/**
 * Admin interface for reviewing and approving deployed contracts
 */
export default function AdminContractsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [contracts, setContracts] = useState<DeployedContract[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedContract, setSelectedContract] = useState<DeployedContract | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  // Fetch contracts from Firebase
  useEffect(() => {
    const contractsRef = collection(firestoreDB, 'deployed-contracts')
    let q = query(contractsRef, orderBy('createdAt', 'desc'))
    
    // Apply filter
    if (filter !== 'all') {
      q = query(contractsRef, where('status', '==', filter), orderBy('createdAt', 'desc'))
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contractsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DeployedContract[]
      
      setContracts(contractsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [filter])

  // Update contract status
  const updateContractStatus = async (contractId: string, status: 'approved' | 'rejected', notes?: string) => {
    setUpdating(true)
    try {
      const contractRef = doc(firestoreDB, 'deployed-contracts', contractId)
      await updateDoc(contractRef, {
        status,
        adminNotes: notes || '',
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.email || 'admin',
        updatedAt: new Date().toISOString()
      })
      
      setSelectedContract(null)
      setAdminNotes('')
    } catch (error) {
      console.error('Error updating contract status:', error)
      alert('Failed to update contract status')
    } finally {
      setUpdating(false)
    }
  }

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    } catch (error) {
      return 'Invalid date'
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <AdminRoute>
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">Contract Management</h1>
              <p className="text-gray-400 mt-2">
                Review and approve deployed smart contracts
              </p>
            </div>
            
            {/* Filter buttons */}
            <div className="flex space-x-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((filterOption) => (
                <Button
                  key={filterOption}
                  variant={filter === filterOption ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilter(filterOption)}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  {filterOption === 'pending' && contracts.filter(c => c.status === 'pending').length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {contracts.filter(c => c.status === 'pending').length}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No contracts found for the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="bg-[#0a0f1f] rounded-lg border border-gray-700 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{contract.projectName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(contract.status)}`}>
                          {contract.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-3">{contract.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Contract Address:</span>
                          <p className="text-white font-mono break-all">{contract.contractAddress}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Owner:</span>
                          <p className="text-white font-mono break-all">{contract.ownerAddress}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Template:</span>
                          <p className="text-white">{contract.templateId}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Chain ID:</span>
                          <p className="text-white">{contract.chainId}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Deployed:</span>
                          <p className="text-white">{formatDate(contract.createdAt)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Collections:</span>
                          <p className="text-white">{contract.collections?.length || 0} NFT collections</p>
                        </div>
                      </div>

                      {contract.adminNotes && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <span className="text-blue-400 text-sm font-medium">Admin Notes:</span>
                          <p className="text-gray-300 text-sm mt-1">{contract.adminNotes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedContract(contract)}
                      >
                        Review
                      </Button>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(`https://cronoscan.com/address/${contract.contractAddress}`, '_blank')}
                      >
                        View on Explorer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Review Modal */}
          {selectedContract && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-[#0a0f1f] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-5 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">Review Contract: {selectedContract.projectName}</h3>
                  <button
                    onClick={() => setSelectedContract(null)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Contract Details */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Contract Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Project Name:</span>
                        <p className="text-white">{selectedContract.projectName}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Description:</span>
                        <p className="text-white">{selectedContract.description}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Contract Address:</span>
                        <p className="text-white font-mono break-all">{selectedContract.contractAddress}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Owner Address:</span>
                        <p className="text-white font-mono break-all">{selectedContract.ownerAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  {selectedContract.socialLinks && Object.keys(selectedContract.socialLinks).length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Social Links</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {Object.entries(selectedContract.socialLinks).map(([platform, url]) => (
                          url && (
                            <div key={platform}>
                              <span className="text-gray-400 capitalize">{platform}:</span>
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">
                                {url}
                              </a>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NFT Collections */}
                  {selectedContract.collections && selectedContract.collections.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">NFT Collections</h4>
                      <div className="space-y-3">
                        {selectedContract.collections.map((collection, index) => (
                          <div key={collection.id} className="bg-gray-800/50 rounded-lg p-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="text-gray-400">Name:</span>
                                <p className="text-white">{collection.name}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Address:</span>
                                <p className="text-white font-mono break-all">{collection.address}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Ratio:</span>
                                <p className="text-white">{collection.ratio}</p>
                              </div>
                            </div>
                            {collection.description && (
                              <div className="mt-2">
                                <span className="text-gray-400">Description:</span>
                                <p className="text-white text-sm">{collection.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Add notes about this contract review..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedContract(null)}
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => updateContractStatus(selectedContract.id, 'rejected', adminNotes)}
                      disabled={updating}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {updating ? 'Updating...' : 'Reject'}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => updateContractStatus(selectedContract.id, 'approved', adminNotes)}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updating ? 'Updating...' : 'Approve'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </AdminRoute>
  )
}
