'use client'

import React from 'react'
import Link from 'next/link'
import { Project } from '@/types/project'
import { GlassCard, Button } from '@/components/ui'

// Module renderer props
interface ModuleRendererProps {
  project: Project;
  className?: string;
}

/**
 * Module renderer component
 * Conditionally renders the enabled modules for a project
 */
export function ModuleRenderer({ project, className = '' }: ModuleRendererProps) {
  // Check if any modules are enabled
  const hasEnabledModules = Object.values(project.modules).some(module => module.enabled)
  
  if (!hasEnabledModules) {
    return (
      <div className={className}>
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">No Modules Enabled</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              This project does not have any modules enabled yet.
            </p>
          </div>
        </GlassCard>
      </div>
    )
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* NFT Mint Module */}
      {project.modules.nftMint.enabled && (
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">NFT Mint</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              {project.modules.nftMint.description || 'Mint NFTs from this collection.'}
            </p>
            
            {project.modules.nftMint.contractAddress ? (
              <div className="bg-[#0a0f1f]/50 p-3 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm text-gray-300 overflow-hidden text-ellipsis">
                    {project.modules.nftMint.contractAddress}
                  </div>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(project.modules.nftMint.contractAddress || '')
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-yellow-400 mb-4">
                No contract address configured.
              </p>
            )}
            
            <Button
              variant="primary"
              size="md"
              disabled={!project.modules.nftMint.contractAddress}
            >
              Mint NFT
            </Button>
          </div>
        </GlassCard>
      )}
      
      {/* NFT Staking Module */}
      {project.modules.nftStaking.enabled && (
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">NFT Staking</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              {project.modules.nftStaking.description || 'Stake your NFTs to earn rewards.'}
            </p>
            
            {project.modules.nftStaking.contractAddress ? (
              <div className="bg-[#0a0f1f]/50 p-3 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm text-gray-300 overflow-hidden text-ellipsis">
                    {project.modules.nftStaking.contractAddress}
                  </div>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(project.modules.nftStaking.contractAddress || '')
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-yellow-400 mb-4">
                No contract address configured.
              </p>
            )}
            
            <Button
              variant="primary"
              size="md"
              disabled={!project.modules.nftStaking.contractAddress}
            >
              Stake NFTs
            </Button>
          </div>
        </GlassCard>
      )}
      
      {/* Coin Staking Module */}
      {project.modules.coinStaking.enabled && (
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">Coin Staking</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              {project.modules.coinStaking.description || 'Stake your tokens to earn rewards.'}
            </p>
            
            {project.modules.coinStaking.contractAddress ? (
              <div className="bg-[#0a0f1f]/50 p-3 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm text-gray-300 overflow-hidden text-ellipsis">
                    {project.modules.coinStaking.contractAddress}
                  </div>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(project.modules.coinStaking.contractAddress || '')
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-yellow-400 mb-4">
                No contract address configured.
              </p>
            )}
            
            <Button
              variant="primary"
              size="md"
              disabled={!project.modules.coinStaking.contractAddress}
            >
              Stake Tokens
            </Button>
          </div>
        </GlassCard>
      )}
      
      {/* LP Staking Module */}
      {project.modules.lpStaking.enabled && (
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">LP Staking</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              {project.modules.lpStaking.description || 'Stake your LP tokens to earn rewards.'}
            </p>
            
            {project.modules.lpStaking.contractAddress ? (
              <div className="bg-[#0a0f1f]/50 p-3 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm text-gray-300 overflow-hidden text-ellipsis">
                    {project.modules.lpStaking.contractAddress}
                  </div>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(project.modules.lpStaking.contractAddress || '')
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-yellow-400 mb-4">
                No contract address configured.
              </p>
            )}
            
            <Button
              variant="primary"
              size="md"
              disabled={!project.modules.lpStaking.contractAddress}
            >
              Stake LP Tokens
            </Button>
          </div>
        </GlassCard>
      )}
      
      {/* Quests Module */}
      {project.modules.quests.enabled && (
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">Quests</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              {project.modules.quests.description || 'Complete quests to earn rewards.'}
            </p>
            
            <Button
              variant="primary"
              size="md"
            >
              View Quests
            </Button>
          </div>
        </GlassCard>
      )}
      
      {/* Vaults Module */}
      {project.modules.vaults.enabled && (
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">Vaults</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              {project.modules.vaults.description || 'Deposit tokens into vaults to earn rewards.'}
            </p>
            
            {project.modules.vaults.contractAddress ? (
              <div className="bg-[#0a0f1f]/50 p-3 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm text-gray-300 overflow-hidden text-ellipsis">
                    {project.modules.vaults.contractAddress}
                  </div>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(project.modules.vaults.contractAddress || '')
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-yellow-400 mb-4">
                No contract address configured.
              </p>
            )}
            
            <Button
              variant="primary"
              size="md"
              disabled={!project.modules.vaults.contractAddress}
            >
              View Vaults
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
