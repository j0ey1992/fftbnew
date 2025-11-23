'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminRoute } from '@/components/providers/auth'
import MainLayout from '@/components/layout/MainLayout'
import { GlassCard, Button } from '@/components/ui'
import { addContractTemplate } from '@/lib/firebase/contract-templates'

/**
 * Admin page for adding a new contract template
 */
export default function AddContractTemplatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('token')
  const [version, setVersion] = useState('1.0.0')
  const [sourceCode, setSourceCode] = useState('')
  const [bytecode, setBytecode] = useState('')
  const [abi, setAbi] = useState('')
  const [parameters, setParameters] = useState('')
  const [enabled, setEnabled] = useState(true)
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      // Validate form
      if (!name || !description || !category || !version || !sourceCode || !bytecode || !abi || !parameters) {
        setError('All fields are required')
        return
      }
      
      // Parse ABI and parameters
      let parsedAbi
      let parsedParameters
      
      try {
        parsedAbi = JSON.parse(abi)
      } catch (error) {
        setError('Invalid ABI JSON')
        return
      }
      
      try {
        parsedParameters = JSON.parse(parameters)
      } catch (error) {
        setError('Invalid parameters JSON')
        return
      }
      
      // Create template
      await addContractTemplate({
        name,
        description,
        category: category as any,
        version,
        sourceCode,
        bytecode,
        abi: parsedAbi,
        parameters: parsedParameters,
        enabled
      })
      
      setSuccess(true)
      
      // Reset form
      setName('')
      setDescription('')
      setCategory('token')
      setVersion('1.0.0')
      setSourceCode('')
      setBytecode('')
      setAbi('')
      setParameters('')
      setEnabled(true)
      
      // Redirect to templates list
      setTimeout(() => {
        router.push('/admin/contract-templates')
      }, 2000)
    } catch (error) {
      console.error('Error adding contract template:', error)
      setError('Failed to add contract template')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <AdminRoute>
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <GlassCard elevation="raised">
            <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add Contract Template</h3>
              <Button
                variant="glass"
                size="sm"
                onClick={() => router.push('/admin/contract-templates')}
              >
                Back to Templates
              </Button>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
                  Contract template added successfully! Redirecting...
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ERC20 Token"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="token">Token</option>
                      <option value="staking">Staking</option>
                      <option value="lp-staking">LP Staking</option>
                      <option value="nft">NFT</option>
                      <option value="vault">Vault</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Version
                    </label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1.0.0"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Enabled
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-300">
                        Enable this template for users
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="A standard ERC20 token with customizable supply, name, and symbol."
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Source Code
                  </label>
                  <textarea
                    value={sourceCode}
                    onChange={(e) => setSourceCode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="// Solidity source code"
                    rows={10}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Bytecode
                  </label>
                  <textarea
                    value={bytecode}
                    onChange={(e) => setBytecode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="0x..."
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    ABI (JSON)
                  </label>
                  <textarea
                    value={abi}
                    onChange={(e) => setAbi(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="[...]"
                    rows={5}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Parameters (JSON)
                  </label>
                  <textarea
                    value={parameters}
                    onChange={(e) => setParameters(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder={`[
  {
    "id": "name",
    "name": "Token Name",
    "type": "string",
    "description": "Name of the token",
    "required": true
  },
  {
    "id": "symbol",
    "name": "Token Symbol",
    "type": "string",
    "description": "Symbol of the token",
    "required": true
  }
]`}
                    rows={10}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="glass"
                    size="md"
                    type="button"
                    onClick={() => router.push('/admin/contract-templates')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    isLoading={loading}
                    disabled={loading}
                  >
                    Add Template
                  </Button>
                </div>
              </form>
            </div>
          </GlassCard>
        </div>
      </MainLayout>
    </AdminRoute>
  )
}
