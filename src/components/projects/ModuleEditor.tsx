'use client'

import { useState } from 'react'
import { Project, ProjectModules, ModuleConfig } from '@/types/project'
import { GlassCard, Button } from '@/components/ui'

interface ModuleEditorProps {
  project: Project
  onChange: (modules: ProjectModules) => void
}

/**
 * Module editor component
 * Allows users to enable/disable and configure modules for their project
 */
export function ModuleEditor({ project, onChange }: ModuleEditorProps) {
  const [modules, setModules] = useState<ProjectModules>(project.modules || {
    nftMint: { enabled: false },
    nftStaking: { enabled: false },
    coinStaking: { enabled: false },
    lpStaking: { enabled: false },
    quests: { enabled: false },
    vaults: { enabled: false }
  })
  const [activeModule, setActiveModule] = useState<keyof ProjectModules | null>(null)

  // Handle module toggle
  const handleModuleToggle = (moduleKey: keyof ProjectModules) => {
    const updatedModules = {
      ...modules,
      [moduleKey]: {
        ...modules[moduleKey],
        enabled: !modules[moduleKey].enabled
      }
    }
    setModules(updatedModules)
    onChange(updatedModules)
  }

  // Handle module update
  const handleModuleUpdate = (moduleKey: keyof ProjectModules, config: Partial<ModuleConfig>) => {
    const updatedModules = {
      ...modules,
      [moduleKey]: {
        ...modules[moduleKey],
        ...config
      }
    }
    setModules(updatedModules)
    onChange(updatedModules)
  }

  // Module descriptions
  const moduleDescriptions: Record<keyof ProjectModules, { title: string; description: string; icon: string }> = {
    nftMint: {
      title: 'NFT Mint',
      description: 'Allow users to mint NFTs from your collection',
      icon: '🖼️'
    },
    nftStaking: {
      title: 'NFT Staking',
      description: 'Allow users to stake their NFTs to earn rewards',
      icon: '🔒'
    },
    coinStaking: {
      title: 'Coin Staking',
      description: 'Allow users to stake tokens to earn rewards',
      icon: '💰'
    },
    lpStaking: {
      title: 'LP Staking',
      description: 'Allow users to stake LP tokens to earn rewards',
      icon: '🔄'
    },
    quests: {
      title: 'Quests',
      description: 'Create quests for users to complete and earn rewards',
      icon: '🏆'
    },
    vaults: {
      title: 'Vaults',
      description: 'Allow users to deposit tokens into vaults to earn rewards',
      icon: '🏦'
    }
  }

  return (
    <div className="space-y-8">
      {/* Module Overview */}
      <GlassCard elevation="flat">
        <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
          <h3 className="text-xl font-bold">Available Modules</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(modules) as Array<keyof ProjectModules>).map((moduleKey) => (
              <div
                key={moduleKey}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  modules[moduleKey].enabled
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-[#0a0f1f]/50 hover:border-gray-500'
                }`}
                onClick={() => setActiveModule(moduleKey)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{moduleDescriptions[moduleKey].icon}</span>
                    <h4 className="font-medium text-white">{moduleDescriptions[moduleKey].title}</h4>
                  </div>
                  <div className="relative inline-flex items-center">
                    <div
                      className={`w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${
                        modules[moduleKey].enabled ? 'bg-blue-600' : 'bg-gray-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleModuleToggle(moduleKey)
                      }}
                    >
                      <div
                        className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                          modules[moduleKey].enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{moduleDescriptions[moduleKey].description}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Module Configuration */}
      {activeModule && (
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xl font-bold">
              {moduleDescriptions[activeModule].icon} {moduleDescriptions[activeModule].title} Configuration
            </h3>
            <div className="flex items-center">
              <div className="relative inline-flex items-center mr-3">
                <div
                  className={`w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${
                    modules[activeModule].enabled ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                  onClick={() => handleModuleToggle(activeModule)}
                >
                  <div
                    className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                      modules[activeModule].enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-300">
                  {modules[activeModule].enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setActiveModule(null)}
              >
                Close
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Module Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Module Name
                </label>
                <input
                  type="text"
                  value={modules[activeModule].name || moduleDescriptions[activeModule].title}
                  onChange={(e) => handleModuleUpdate(activeModule, { name: e.target.value })}
                  placeholder={moduleDescriptions[activeModule].title}
                  className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                />
                <p className="mt-1 text-xs text-gray-400">
                  This name will be displayed to users on your project page
                </p>
              </div>

              {/* Module Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Module Description
                </label>
                <textarea
                  value={modules[activeModule].description || moduleDescriptions[activeModule].description}
                  onChange={(e) => handleModuleUpdate(activeModule, { description: e.target.value })}
                  placeholder={moduleDescriptions[activeModule].description}
                  className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                  rows={3}
                />
                <p className="mt-1 text-xs text-gray-400">
                  This description will help users understand what this module does
                </p>
              </div>

              {/* Contract Address */}
              {activeModule !== 'quests' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contract Address
                  </label>
                  <input
                    type="text"
                    value={modules[activeModule].contractAddress || ''}
                    onChange={(e) => handleModuleUpdate(activeModule, { contractAddress: e.target.value })}
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    The smart contract address for this module
                  </p>
                </div>
              )}

              {/* Module-specific configuration */}
              {activeModule === 'nftMint' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">NFT Mint Configuration</h4>
                  <p className="text-sm text-gray-300">
                    Configure your NFT mint module with the contract address of your NFT collection.
                    Users will be able to mint NFTs directly from your project page.
                  </p>
                </div>
              )}

              {activeModule === 'nftStaking' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">NFT Staking Configuration</h4>
                  <p className="text-sm text-gray-300">
                    Configure your NFT staking module with the contract address of your staking contract.
                    Users will be able to stake their NFTs and earn rewards.
                  </p>
                </div>
              )}

              {activeModule === 'coinStaking' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">Coin Staking Configuration</h4>
                  <p className="text-sm text-gray-300">
                    Configure your coin staking module with the contract address of your staking contract.
                    Users will be able to stake their tokens and earn rewards.
                  </p>
                </div>
              )}

              {activeModule === 'lpStaking' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">LP Staking Configuration</h4>
                  <p className="text-sm text-gray-300">
                    Configure your LP staking module with the contract address of your staking contract.
                    Users will be able to stake their LP tokens and earn rewards.
                  </p>
                </div>
              )}

              {activeModule === 'quests' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">Quests Configuration</h4>
                  <p className="text-sm text-gray-300">
                    Configure your quests module to create tasks for users to complete and earn rewards.
                    You can create quests in the quests section of your dashboard.
                  </p>
                </div>
              )}

              {activeModule === 'vaults' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">Vaults Configuration</h4>
                  <p className="text-sm text-gray-300">
                    Configure your vaults module with the contract address of your vault contract.
                    Users will be able to deposit tokens into vaults and earn rewards.
                  </p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
