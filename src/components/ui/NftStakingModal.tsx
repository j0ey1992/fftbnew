'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'
import { GlassCard } from './GlassCard'
import { NftCard } from './NftCard'

interface NftItem {
  id: string
  name: string
  image: string
  staked: boolean
  rarity?: string
  rewards?: string
  expireDate?: number
  collection?: string
}

type ModalType = 'stake' | 'unstake' | 'claim'

interface NftStakingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedNfts: string[], stakingPeriod?: number) => void
  title: string
  description?: string
  nfts: NftItem[]
  type: ModalType
  stakingPeriods?: {
    label: string
    days: number
    rewardRate: string
  }[]
}

export function NftStakingModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  nfts,
  type,
  stakingPeriods = []
}: NftStakingModalProps) {
  const [selectedNfts, setSelectedNfts] = useState<string[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  
  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      // Use requestAnimationFrame to prevent blocking the UI
      requestAnimationFrame(() => {
        setSelectedNfts([])
        setSelectedPeriod(0)
        setIsLoading(false)
      })
    }
  }, [isOpen])
  
  // Handle NFT selection
  const handleNftSelect = (nftId: string) => {
    if (selectedNfts.includes(nftId)) {
      setSelectedNfts(selectedNfts.filter(id => id !== nftId))
    } else {
      setSelectedNfts([...selectedNfts, nftId])
    }
  }
  
  // Handle confirming the action
  const handleConfirm = () => {
    if (selectedNfts.length === 0) return;
    
    setIsLoading(true);
    
    // Call the onConfirm callback immediately without setTimeout
    // This allows the parent component to handle the actual async operation
    try {
      onConfirm(selectedNfts, type === 'stake' ? stakingPeriods[selectedPeriod]?.days : undefined);
      // Note: We don't call onClose() here as the parent component will handle this
      // after the transaction is complete
    } catch (error) {
      console.error('Error in modal confirmation:', error);
      setIsLoading(false);
    }
  }
  
  // Return null if modal is not open
  if (!isOpen) return null
  
  // Filter NFTs based on modal type
  const filteredNfts = nfts.filter(nft => {
    if (type === 'stake') return !nft.staked
    if (type === 'unstake') return nft.staked
    if (type === 'claim') return nft.staked && parseFloat(nft.rewards?.split(' ')[0] || '0') > 0
    return true
  })
  
  // Get total rewards for claim modal
  const getTotalRewards = () => {
    if (type !== 'claim') return null
    
    const selectedNftItems = nfts.filter(nft => selectedNfts.includes(nft.id))
    const total = selectedNftItems.reduce((sum, nft) => {
      return sum + parseFloat(nft.rewards?.split(' ')[0] || '0')
    }, 0)
    
    return total.toFixed(2) + ' CRO'
  }
  
  // Calculate action label based on modal type
  const getActionLabel = () => {
    if (type === 'stake') return `Stake ${selectedNfts.length} NFT${selectedNfts.length !== 1 ? 's' : ''}`
    if (type === 'unstake') return `Unstake ${selectedNfts.length} NFT${selectedNfts.length !== 1 ? 's' : ''}`
    if (type === 'claim') return `Claim ${getTotalRewards()}`
    return 'Confirm'
  }
  
  // Color scheme based on type
  const getColorScheme = () => {
    if (type === 'stake') return 'from-blue-600 to-primary-dark'
    if (type === 'unstake') return 'from-orange-500 to-amber-600'
    if (type === 'claim') return 'from-green-500 to-emerald-600'
    return 'from-blue-600 to-primary-dark'
  }
  
  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  }
  
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pb-20">
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div 
            className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl relative z-10"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <GlassCard elevation="raised" className="overflow-hidden">
              {/* Header with gradient background */}
              <div className={`p-5 bg-gradient-to-r ${getColorScheme()} text-white`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">{title}</h3>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {description && <p className="text-sm text-white/80 mt-1">{description}</p>}
              </div>
              
              <div className="p-5 max-h-[calc(90vh-180px)] overflow-y-auto">
                {/* Staking Period Selection (only for stake modal) */}
                {type === 'stake' && stakingPeriods.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-white font-medium mb-2">Select Staking Period</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {stakingPeriods.map((period, index) => (
                        <button
                          key={index}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            selectedPeriod === index
                              ? 'bg-primary text-white border-primary-dark'
                              : 'bg-gray-800/50 text-gray-300 border-gray-700/50 hover:bg-gray-700/50'
                          }`}
                          onClick={() => setSelectedPeriod(index)}
                        >
                          <div className="text-xs font-medium mb-1">{period.label}</div>
                          <div className="text-xs opacity-80">Reward Rate: {period.rewardRate} per week</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Available NFTs with Select All button */}
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-medium">
                    {filteredNfts.length > 0 
                      ? `Select NFTs (${selectedNfts.length}/${filteredNfts.length})`
                      : 'No NFTs available'
                    }
                  </h4>
                  
                  {filteredNfts.length > 0 && (
                    <button
                      onClick={() => {
                        if (selectedNfts.length === filteredNfts.length) {
                          // If all are selected, deselect all
                          setSelectedNfts([]);
                        } else {
                          // Otherwise select all
                          setSelectedNfts(filteredNfts.map(nft => nft.id));
                        }
                      }}
                      className="text-sm px-3 py-1 rounded-md bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    >
                      {selectedNfts.length === filteredNfts.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
                
                {filteredNfts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredNfts.map((nft) => {
                      console.log('Rendering NFT in modal:', nft);
                      return (
                        <div 
                          key={nft.id} 
                          className="cursor-pointer transform transition-transform hover:scale-[1.02]"
                          onClick={() => handleNftSelect(nft.id)}
                        >
                          <div className={`bg-gray-800/60 rounded-xl overflow-hidden border ${selectedNfts.includes(nft.id) ? 'border-primary' : 'border-gray-700/50'} hover:border-primary/50 transition-colors`}>
                            <div className="relative h-32 w-full overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent z-10"></div>
                              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                {nft.image ? (
                                  <Image
                                    src={nft.image || '/kris-logo.svg'}
                                    alt={nft.name}
                                    width={200}
                                    height={200}
                                    className="w-full h-full object-cover"
                                    unoptimized={true}
                                  />
                                ) : (
                                  <div className="text-gray-500 flex flex-col items-center justify-center h-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>No Image</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Selection indicator */}
                              {selectedNfts.includes(nft.id) && (
                                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg z-20">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-3">
                              <h3 className="text-white font-medium text-sm truncate">{nft.name || `NFT #${nft.id.split('-')[1]}`}</h3>
                              
                              {nft.collection && (
                                <div className="text-xs text-gray-400 truncate">{nft.collection}</div>
                              )}
                              
                              {nft.staked && (
                                <div className="mt-2 flex items-center">
                                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">Staked</span>
                                </div>
                              )}
                              
                              {nft.rewards && parseFloat(nft.rewards) > 0 && (
                                <div className="mt-1 text-xs text-green-400">
                                  Rewards: {nft.rewards}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <div className="text-gray-400 mb-2">No NFTs available for this action</div>
                    <Button variant="outline" size="sm" onClick={onClose}>
                      Go Back
                    </Button>
                  </div>
                )}
                
                {/* Summary for claim modal */}
                {type === 'claim' && selectedNfts.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total rewards:</span>
                      <span className="text-green-400 font-medium">{getTotalRewards()}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions Footer */}
              <div className="p-5 border-t border-gray-700/50 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                
                <Button
                  variant="gradient"
                  size="md"
                  className={`bg-gradient-to-r ${getColorScheme()}`}
                  onClick={handleConfirm}
                  disabled={selectedNfts.length === 0 || isLoading}
                  isLoading={isLoading}
                >
                  {getActionLabel()}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
