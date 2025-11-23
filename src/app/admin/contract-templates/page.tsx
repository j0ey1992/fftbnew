'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminRoute } from '@/components/providers/auth'
import MainLayout from '@/components/layout/MainLayout'
import { GlassCard, Button, Table, Badge } from '@/components/ui'
import { ContractTemplate } from '@/types/contract-templates'
import { getAllContractTemplates, toggleTemplateStatus, deleteContractTemplate } from '@/lib/firebase/contract-templates'
import { useAppKitAccount } from '@reown/appkit/react'

/**
 * Admin page for managing contract templates
 */
export default function ContractTemplatesPage() {
  const router = useRouter()
  const { isConnected, address } = useAppKitAccount()
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch contract templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        const templates = await getAllContractTemplates()
        setTemplates(templates)
        setError(null)
      } catch (error) {
        console.error('Error fetching contract templates:', error)
        setError('Failed to fetch contract templates')
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  // Handle toggle template status
  const handleToggleStatus = async (id: string, enabled: boolean) => {
    try {
      await toggleTemplateStatus(id, !enabled)
      setTemplates(templates.map(template => 
        template.id === id ? { ...template, enabled: !enabled } : template
      ))
    } catch (error) {
      console.error('Error toggling template status:', error)
      setError('Failed to toggle template status')
    }
  }

  // Handle delete template
  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      try {
        await deleteContractTemplate(id)
        setTemplates(templates.filter(template => template.id !== id))
      } catch (error) {
        console.error('Error deleting template:', error)
        setError('Failed to delete template')
      }
    }
  }

  // Format category for display
  const formatCategory = (category: string) => {
    switch (category) {
      case 'staking':
        return 'Staking'
      case 'lp-staking':
        return 'LP Staking'
      case 'token':
        return 'Token'
      case 'nft':
        return 'NFT'
      case 'vault':
        return 'Vault'
      default:
        return category
    }
  }

  return (
    <AdminRoute>
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          <GlassCard elevation="raised">
            <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold">Contract Templates</h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/admin/contract-templates/add')}
              >
                Add New Template
              </Button>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No contract templates found</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push('/admin/contract-templates/add')}
                  >
                    Add Your First Template
                  </Button>
                </div>
              ) : (
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Name</Table.HeaderCell>
                      <Table.HeaderCell>Category</Table.HeaderCell>
                      <Table.HeaderCell>Version</Table.HeaderCell>
                      <Table.HeaderCell>Status</Table.HeaderCell>
                      <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {templates.map((template) => (
                      <Table.Row key={template.id}>
                        <Table.Cell>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-400">{template.description}</div>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={
                            template.category === 'staking' ? 'blue' :
                            template.category === 'lp-staking' ? 'purple' :
                            template.category === 'token' ? 'green' :
                            template.category === 'nft' ? 'orange' :
                            template.category === 'vault' ? 'cyan' : 'gray'
                          }>
                            {formatCategory(template.category)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{template.version}</Table.Cell>
                        <Table.Cell>
                          <Badge color={template.enabled ? 'green' : 'gray'}>
                            {template.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex space-x-2">
                            <Button
                              variant="glass"
                              size="xs"
                              onClick={() => router.push(`/admin/contract-templates/edit/${template.id}`)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant={template.enabled ? 'warning' : 'success'}
                              size="xs"
                              onClick={() => handleToggleStatus(template.id, template.enabled)}
                            >
                              {template.enabled ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              variant="danger"
                              size="xs"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              )}
            </div>
          </GlassCard>
        </div>
      </MainLayout>
    </AdminRoute>
  )
}
