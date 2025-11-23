/**
 * Convert IPFS URLs to use custom API endpoint
 * @param url The original URL (can be ipfs://, https://ipfs.io/ipfs/, or regular URL)
 * @returns The converted URL using the custom API endpoint
 */
export function convertIpfsUrl(url: string | undefined | null): string {
  if (!url) return '/placeholder-nft.png';
  
  // If already using our custom gateway, convert to proxy
  if (url.includes('88.99.93.159:3000/api/ipfs/')) {
    const ipfsPath = url.split('88.99.93.159:3000/api/ipfs/')[1];
    return `/api/ipfs/${ipfsPath}`;
  }
  
  // If already using our proxy, return as-is
  if (url.includes('/api/ipfs/')) {
    return url;
  }
  
  // Extract IPFS path from various formats (preserving full path including subdirectories and filename)
  let ipfsPath: string | null = null;
  
  // Handle ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    ipfsPath = url.replace('ipfs://', '');
  }
  // Handle https://ipfs.io/ipfs/ format
  else if (url.includes('ipfs.io/ipfs/')) {
    const match = url.match(/ipfs\.io\/ipfs\/(.+?)(?:\?|#|$)/);
    if (match) {
      ipfsPath = match[1];
    }
  }
  // Handle gateway.pinata.cloud format
  else if (url.includes('gateway.pinata.cloud/ipfs/')) {
    const match = url.match(/gateway\.pinata\.cloud\/ipfs\/(.+?)(?:\?|#|$)/);
    if (match) {
      ipfsPath = match[1];
    }
  }
  // Handle custom Pinata subdomain format (like roofinance.mypinata.cloud)
  else if (url.includes('.mypinata.cloud/ipfs/')) {
    const match = url.match(/\.mypinata\.cloud\/ipfs\/(.+?)(?:\?|#|$)/);
    if (match) {
      ipfsPath = match[1];
    }
  }
  // Handle cloudflare-ipfs.com format
  else if (url.includes('cloudflare-ipfs.com/ipfs/')) {
    const match = url.match(/cloudflare-ipfs\.com\/ipfs\/(.+?)(?:\?|#|$)/);
    if (match) {
      ipfsPath = match[1];
    }
  }
  // Handle ipfs.dweb.link format
  else if (url.includes('ipfs.dweb.link/ipfs/')) {
    const match = url.match(/ipfs\.dweb\.link\/ipfs\/(.+?)(?:\?|#|$)/);
    if (match) {
      ipfsPath = match[1];
    }
  }
  // Handle other common IPFS gateways
  else if (url.includes('/ipfs/')) {
    const match = url.match(/\/ipfs\/(.+?)(?:\?|#|$)/);
    if (match) {
      ipfsPath = match[1];
    }
  }
  // Handle direct IPFS hash (starts with Qm or ba)
  else if (url.match(/^(Qm[a-zA-Z0-9]{44}|ba[a-zA-Z0-9]+)/)) {
    ipfsPath = url;
  }
  
  // If we found an IPFS path, use the custom API
  if (ipfsPath) {
    // Clean up double slashes and normalize the path
    const cleanPath = ipfsPath.replace(/\/+/g, '/');
    
    // Extract just the hash to validate it
    const hashOnly = cleanPath.split('/')[0];
    
    // Validate the hash format
    if (hashOnly.match(/^(Qm[a-zA-Z0-9]{44}|ba[a-zA-Z0-9]+)$/)) {
      // Use local proxy to avoid mixed content issues
      return `/api/ipfs/${cleanPath}`;
    }
  }
  
  // Return original URL if it's not an IPFS URL or if hash is invalid
  return url;
}

/**
 * Check if a URL is an IPFS URL
 * @param url The URL to check
 * @returns True if it's an IPFS URL, false otherwise
 */
export function isIpfsUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  
  return url.startsWith('ipfs://') ||
         url.includes('ipfs.io/ipfs/') ||
         url.includes('gateway.pinata.cloud/ipfs/') ||
         url.includes('cloudflare-ipfs.com/ipfs/') ||
         url.includes('ipfs.dweb.link/ipfs/') ||
         url.includes('88.99.93.159:3000/api/ipfs/') ||
         url.includes('/ipfs/') ||
         url.match(/^(Qm[a-zA-Z0-9]{44}|ba[a-zA-Z0-9]+)/) !== null;
}