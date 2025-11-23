'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui'
import useImageStorage from '@/hooks/useImageStorage'

interface ImageEditorProps {
  initialImageUrl?: string
  onImageChange: (imageUrl: string | null) => void
  imageType?: 'background' | 'logo' | 'icon'
  storagePath?: string
}

/**
 * Image editor component
 * Allows users to upload, preview, and manage images for components
 */
export function ImageEditor({
  initialImageUrl,
  onImageChange,
  imageType = 'background',
  storagePath = 'project-components'
}: ImageEditorProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isUploading, progress, error, upload, remove } = useImageStorage(`${storagePath}/${imageType}`)

  // Update local state when initialImageUrl changes
  useEffect(() => {
    setImageUrl(initialImageUrl || null)
  }, [initialImageUrl])

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await upload(file)
      if (result?.url) {
        setImageUrl(result.url)
        onImageChange(result.url)
      }
    } catch (err) {
      console.error('Error uploading image:', err)
    }
  }

  // Handle image removal
  const handleRemoveImage = async () => {
    if (!imageUrl) return

    try {
      await remove(imageUrl)
      setImageUrl(null)
      onImageChange(null)
    } catch (err) {
      console.error('Error removing image:', err)
    }
  }

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-300">
          {imageType.charAt(0).toUpperCase() + imageType.slice(1)} Image
        </h4>
        {imageUrl && (
          <button
            className="text-red-400 hover:text-red-300 text-sm"
            onClick={handleRemoveImage}
          >
            Remove
          </button>
        )}
      </div>

      {/* Image preview */}
      <div 
        className={`border border-dashed rounded-lg overflow-hidden flex items-center justify-center ${
          imageUrl ? 'border-gray-600' : 'border-gray-700 hover:border-gray-500'
        }`}
        style={{ minHeight: imageType === 'background' ? '200px' : '120px' }}
      >
        {imageUrl ? (
          <div className="relative w-full h-full">
            <img 
              src={imageUrl} 
              alt={`${imageType} image`} 
              className={`w-full h-full object-${imageType === 'background' ? 'cover' : 'contain'}`}
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <Button
                variant="glass"
                size="sm"
                onClick={handleUploadClick}
              >
                Replace Image
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="p-6 text-center cursor-pointer"
            onClick={handleUploadClick}
          >
            <div className="w-12 h-12 mx-auto mb-2 bg-blue-500/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">
              {isUploading ? `Uploading... ${progress}%` : 'Click to upload an image'}
            </p>
            {error && (
              <p className="text-red-400 text-xs mt-1">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Image options */}
      {imageUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Position</label>
            <select 
              className="bg-[#0a0f1f] border border-gray-700 rounded text-xs px-2 py-1"
              defaultValue="center"
            >
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          {imageType === 'background' && (
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Size</label>
              <select 
                className="bg-[#0a0f1f] border border-gray-700 rounded text-xs px-2 py-1"
                defaultValue="cover"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Original</option>
              </select>
            </div>
          )}
          
          {imageType === 'logo' && (
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Size</label>
              <select 
                className="bg-[#0a0f1f] border border-gray-700 rounded text-xs px-2 py-1"
                defaultValue="medium"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
