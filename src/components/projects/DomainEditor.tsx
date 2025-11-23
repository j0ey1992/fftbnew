'use client'

import { useState } from 'react'
import { Project, ProjectDomain } from '@/types/project'
import { GlassCard, Button } from '@/components/ui'

interface DomainEditorProps {
  project: Project
  onChange: (domain: ProjectDomain) => void
}

/**
 * Domain editor component
 * Allows users to configure custom domains for their project
 */
export function DomainEditor({ project, onChange }: DomainEditorProps) {
  const [domain, setDomain] = useState<ProjectDomain>(project.domains || {
    customDomain: '',
    redirectEnabled: false
  })
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null)

  // Handle domain update
  const handleDomainUpdate = (updatedDomain: ProjectDomain) => {
    setDomain(updatedDomain)
    onChange(updatedDomain)
  }

  // Handle custom domain change
  const handleCustomDomainChange = (customDomain: string) => {
    handleDomainUpdate({
      ...domain,
      customDomain
    })
    
    // Reset validation result when domain changes
    setValidationResult(null)
  }

  // Handle redirect toggle
  const handleRedirectToggle = () => {
    handleDomainUpdate({
      ...domain,
      redirectEnabled: !domain.redirectEnabled
    })
  }

  // Validate domain
  const validateDomain = async () => {
    if (!domain.customDomain) {
      setValidationResult({
        valid: false,
        message: 'Please enter a domain name'
      })
      return
    }
    
    setIsValidating(true)
    setValidationResult(null)
    
    try {
      // This would be replaced with an actual API call to validate the domain
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simple validation for demonstration
      const isValid = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(domain.customDomain)
      
      if (isValid) {
        setValidationResult({
          valid: true,
          message: 'Domain is valid and available'
        })
      } else {
        setValidationResult({
          valid: false,
          message: 'Invalid domain format. Please enter a valid domain name (e.g., example.com)'
        })
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        message: 'Error validating domain'
      })
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Custom Domain */}
      <GlassCard elevation="flat">
        <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
          <h3 className="text-xl font-bold">Custom Domain</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Domain Name
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={domain.customDomain || ''}
                  onChange={(e) => handleCustomDomainChange(e.target.value)}
                  placeholder="example.com"
                  className="flex-1 px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={validateDomain}
                  isLoading={isValidating}
                  disabled={isValidating || !domain.customDomain}
                  className="rounded-l-none"
                >
                  Validate
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Enter your custom domain name (e.g., example.com)
              </p>
              
              {validationResult && (
                <div className={`mt-3 p-3 rounded-lg ${
                  validationResult.valid ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  <p className={`text-sm ${
                    validationResult.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {validationResult.message}
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center">
                <div
                  className={`w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${
                    domain.redirectEnabled ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                  onClick={handleRedirectToggle}
                >
                  <div
                    className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                      domain.redirectEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-300">
                  Enable domain redirect
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                When enabled, visitors to your custom domain will be redirected to your project page
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Domain Setup Instructions */}
      <GlassCard elevation="flat">
        <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
          <h3 className="text-xl font-bold">Domain Setup Instructions</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-gray-300">
              To connect your custom domain to your project, you'll need to configure your domain's DNS settings.
              Follow these steps:
            </p>
            
            <div className="space-y-4 mt-4">
              <div className="p-4 border border-gray-700 rounded-lg">
                <h4 className="font-medium text-white mb-2">1. Add a CNAME record</h4>
                <div className="bg-[#0a0f1f]/50 p-3 rounded-lg font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">CNAME</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-400">Host:</span>
                    <span className="text-white">@</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-400">Value:</span>
                    <span className="text-white">projects.roofinance.com</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-400">TTL:</span>
                    <span className="text-white">3600</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-700 rounded-lg">
                <h4 className="font-medium text-white mb-2">2. Add TXT record for verification</h4>
                <div className="bg-[#0a0f1f]/50 p-3 rounded-lg font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">TXT</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-400">Host:</span>
                    <span className="text-white">_roo-verification</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-400">Value:</span>
                    <span className="text-white">project-{project.id}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-400">TTL:</span>
                    <span className="text-white">3600</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-300">
                DNS changes can take up to 24-48 hours to propagate. Once your DNS is configured correctly,
                your custom domain will be automatically connected to your project.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
