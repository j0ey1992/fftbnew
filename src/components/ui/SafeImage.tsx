'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { isIpfsUrl } from '@/lib/utils/ipfs-url'

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
}

/**
 * SafeImage component that handles broken Firebase Storage URLs and IPFS images
 * For IPFS URLs from custom API, uses regular img tag to bypass Next.js optimization
 * Attempts to fix URLs missing file extensions for Firebase Storage
 */
export function SafeImage({ src, fallbackSrc = '/placeholder.png', alt, className, ...props }: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [attemptedExtensions, setAttemptedExtensions] = useState<string[]>([])
  
  const handleError = () => {
    // If it's a Firebase Storage URL without extension, try common extensions
    if (typeof imageSrc === 'string' && 
        imageSrc.includes('storage.googleapis.com') && 
        !imageSrc.match(/\.(png|jpg|jpeg|gif|webp)$/i) &&
        attemptedExtensions.length < 5) {
      
      const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
      const nextExtension = extensions[attemptedExtensions.length]
      
      if (nextExtension) {
        setAttemptedExtensions([...attemptedExtensions, nextExtension])
        setImageSrc(imageSrc + nextExtension)
        return
      }
    }
    
    // If all attempts failed or it's not a Firebase URL, use fallback
    if (!hasError) {
      setHasError(true)
      setImageSrc(fallbackSrc)
    }
  }
  
  // For IPFS URLs from our custom API, use regular img tag to bypass Next.js optimization
  if (typeof imageSrc === 'string' && imageSrc.includes('88.99.93.159:3000/api/ipfs/')) {
    // Extract only the props that are valid for img elements
    const { fill, priority, sizes, quality, placeholder, blurDataURL, ...imgProps } = props
    
    return (
      <img
        {...imgProps}
        src={imageSrc}
        alt={alt}
        className={className}
        onError={handleError}
        style={{
          width: fill ? '100%' : props.width,
          height: fill ? '100%' : props.height,
          objectFit: props.style?.objectFit || 'cover',
          ...props.style
        }}
      />
    )
  }
  
  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      sizes={props.sizes || (props.fill ? "100vw" : undefined)}
    />
  )
}