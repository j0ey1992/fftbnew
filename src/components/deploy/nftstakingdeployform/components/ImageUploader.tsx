'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface ImageUploaderProps {
  label: string
  preview: string | null
  onUpload: (file: File) => void
  maxSize: number // in MB
  accept?: string
  className?: string
  variant?: 'logo' | 'banner'
}

/**
 * Reusable image uploader component with preview
 */
export default function ImageUploader({
  label,
  preview,
  onUpload,
  maxSize,
  accept = 'image/*',
  className = '',
  variant = 'banner'
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert(`${label} must be an image file`)
      return
    }

    if (file.size > maxSize * 1024 * 1024) {
      alert(`${label} file size must be less than ${maxSize}MB`)
      return
    }

    onUpload(file)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className={`bg-gray-900/40 p-4 rounded-xl border border-gray-700/50 ${className}`}>
      <label className="block text-gray-300 text-sm font-medium mb-3">{label}</label>
      
      {variant === 'logo' ? (
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 relative w-20 h-20 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-600 flex items-center justify-center">
            {preview ? (
              <Image src={preview} alt="Logo preview" fill style={{ objectFit: 'cover' }} className="rounded-full" />
            ) : (
              <span className="text-gray-500 text-xs text-center">No logo</span>
            )}
          </div>
          <div>
            <input
              type="file"
              ref={inputRef}
              onChange={handleFileChange}
              accept={accept}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClick}
            >
              {preview ? 'Change Logo' : 'Upload Logo'}
            </Button>
            <p className="text-gray-500 text-xs mt-1">Max {maxSize}MB, PNG/JPG</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {preview && (
            <div className="relative w-full h-40 bg-gray-800 rounded-lg overflow-hidden border border-gray-600">
              <Image src={preview} alt="Banner preview" fill style={{ objectFit: 'cover' }} />
            </div>
          )}
          <div>
            <input
              type="file"
              ref={inputRef}
              onChange={handleFileChange}
              accept={accept}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClick}
            >
              {preview ? 'Change Banner' : 'Upload Banner'}
            </Button>
            <p className="text-gray-500 text-xs mt-1">Max {maxSize}MB, PNG/JPG</p>
          </div>
        </div>
      )}
    </div>
  )
}
