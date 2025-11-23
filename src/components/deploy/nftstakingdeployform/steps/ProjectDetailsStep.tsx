'use client'

import { useState } from 'react'
import { DeploymentData } from '../types'
import StepHeader from '../components/StepHeader'
import ImageUploader from '../components/ImageUploader'
import SocialLinksForm from '../components/SocialLinksForm'

interface ProjectDetailsStepProps {
  deploymentData: DeploymentData
  onUpdateData: (data: Partial<DeploymentData>) => void
}

/**
 * Step 2: Project Details
 */
export default function ProjectDetailsStep({
  deploymentData,
  onUpdateData
}: ProjectDetailsStepProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  // Handle project detail changes
  const handleProjectDetailChange = (field: string, value: string) => {
    onUpdateData({ [field]: value })
  }

  // Handle social link changes
  const handleSocialLinkChange = (platform: string, value: string) => {
    onUpdateData({
      socialLinks: {
        ...deploymentData.socialLinks,
        [platform]: value
      }
    })
  }

  // Handle logo upload
  const handleLogoUpload = (file: File) => {
    onUpdateData({ logoFile: file })
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle banner upload
  const handleBannerUpload = (file: File) => {
    onUpdateData({ bannerFile: file })
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setBannerPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <StepHeader 
        stepNumber={2} 
        title="Project Details"
        description="Add project information, branding, and social links"
      />
      
      {/* Project Name */}
      <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700/50">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Project Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={deploymentData.projectName}
          onChange={(e) => handleProjectDetailChange('projectName', e.target.value)}
          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0072ff] focus:border-transparent transition-all"
          placeholder="e.g., Roo NFT Staking"
        />
      </div>

      {/* Description */}
      <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700/50">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={deploymentData.description}
          onChange={(e) => handleProjectDetailChange('description', e.target.value)}
          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0072ff] focus:border-transparent transition-all resize-none"
          rows={4}
          placeholder="Describe your project..."
        />
      </div>

      {/* Logo Upload */}
      <ImageUploader
        label="Project Logo"
        preview={logoPreview}
        onUpload={handleLogoUpload}
        maxSize={2}
        variant="logo"
      />

      {/* Banner Upload */}
      <ImageUploader
        label="Project Banner"
        preview={bannerPreview}
        onUpload={handleBannerUpload}
        maxSize={5}
        variant="banner"
      />

      {/* Social Links */}
      <SocialLinksForm
        socialLinks={deploymentData.socialLinks}
        onChange={handleSocialLinkChange}
      />
    </div>
  )
}
