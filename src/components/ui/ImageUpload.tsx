'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label: string
  placeholder?: string
  aspectRatio?: string
  maxSizeMB?: number
  accept?: string
  description?: string
}

export default function ImageUpload({
  value,
  onChange,
  label,
  placeholder = 'https://example.com/image.png',
  aspectRatio = 'aspect-square',
  maxSizeMB = 5,
  accept = 'image/*',
  description
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState(value)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUrlChange = (url: string) => {
    onChange(url)
    setPreview(url)
    setError(null)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      // Create a preview URL
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      // Upload to Firebase storage via backend
      const formData = new FormData()
      formData.append('file', file)
      
      // Determine upload type based on aspect ratio
      const uploadType = aspectRatio === 'aspect-banner' ? 'banner' : 'logo'
      formData.append('type', uploadType)

      // Get CSRF token from meta tag or cookie
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                       document.cookie.split('; ').find(row => row.startsWith('_csrf='))?.split('=')[1]

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/nft-staking/${uploadType}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken || ''
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.url) {
        onChange(data.url)
        setPreview(data.url)
      } else {
        throw new Error('No URL returned from upload')
      }
      
      // Clean up the object URL
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      console.error('Upload error:', err)
      // Reset preview on error
      setPreview(value || '')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onChange('')
    setPreview('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-gray-300 text-sm font-medium mb-2">
        {label}
      </label>

      {/* Preview */}
      {preview && (
        <div className="mb-3">
          <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${aspectRatio === 'aspect-banner' ? 'aspect-[3/1]' : 'aspect-square max-w-[200px]'}`}>
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {/* URL Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          placeholder={placeholder}
        />

        {/* File Upload Button */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Image
              </>
            )}
          </button>
          <span className="text-xs text-gray-400">or paste URL above</span>
        </div>
      </div>

      {description && (
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}