'use client'

import { useState } from 'react'
import Image from 'next/image'

interface TokenImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackSrc?: string
}

export function TokenImage({ 
  src, 
  alt, 
  width = 40, 
  height = 40, 
  className = '',
  fallbackSrc = '/Roo.png'
}: TokenImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  
  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }
  
  // For external URLs, use regular img tag to avoid Next.js Image restrictions
  const isExternalUrl = imgSrc.startsWith('http://') || imgSrc.startsWith('https://')
  
  if (isExternalUrl) {
    return (
      <img
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        loading="lazy"
      />
    )
  }
  
  // For local images, use Next.js Image
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  )
}