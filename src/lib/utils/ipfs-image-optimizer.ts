/**
 * IPFS Image Optimization Utility
 * Provides helper functions for optimizing images through the private IPFS gateway
 */

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
  quality?: number
}

/**
 * Add optimization parameters to an IPFS gateway URL
 * @param url The IPFS gateway URL
 * @param options Optimization options
 * @returns Optimized URL with query parameters
 */
export function optimizeIpfsImage(url: string, options: ImageOptimizationOptions = {}): string {
  // Only optimize if it's our private gateway
  if (!url.includes('88.99.93.159:3000/api/ipfs/')) {
    return url
  }

  const { width, height, format = 'webp', quality = 85 } = options
  const params = new URLSearchParams()

  if (width) params.set('width', width.toString())
  if (height) params.set('height', height.toString())
  if (format) params.set('format', format)
  if (quality) params.set('quality', quality.toString())

  const queryString = params.toString()
  return queryString ? `${url}?${queryString}` : url
}

/**
 * Get optimized IPFS image URL for different use cases
 */
export const getOptimizedIpfsUrl = {
  /**
   * Thumbnail for NFT cards (200x200, WebP, quality 80)
   */
  thumbnail: (url: string) => optimizeIpfsImage(url, {
    width: 200,
    height: 200,
    format: 'webp',
    quality: 80
  }),

  /**
   * Medium size for modals (400x400, WebP, quality 85)
   */
  medium: (url: string) => optimizeIpfsImage(url, {
    width: 400,
    height: 400,
    format: 'webp',
    quality: 85
  }),

  /**
   * Large size for full view (800x800, WebP, quality 90)
   */
  large: (url: string) => optimizeIpfsImage(url, {
    width: 800,
    height: 800,
    format: 'webp',
    quality: 90
  }),

  /**
   * Banner images (1200x400, WebP, quality 85)
   */
  banner: (url: string) => optimizeIpfsImage(url, {
    width: 1200,
    height: 400,
    format: 'webp',
    quality: 85
  }),

  /**
   * Mobile responsive - adapts based on screen size
   */
  responsive: (url: string, isMobile: boolean = false) => {
    const size = isMobile ? 150 : 300
    return optimizeIpfsImage(url, {
      width: size,
      height: size,
      format: 'webp',
      quality: 85
    })
  }
}

/**
 * Check if URL is from our private IPFS gateway
 */
export function isPrivateIpfsGateway(url: string): boolean {
  return url.includes('88.99.93.159:3000/api/ipfs/')
}