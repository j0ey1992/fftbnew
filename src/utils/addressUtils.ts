/**
 * Normalizes an Ethereum address to lowercase
 * @param address The Ethereum address to normalize
 * @returns The normalized address in lowercase
 */
export function normalizeAddress(address: string): string {
  if (!address) return '';
  return address.toLowerCase();
}

/**
 * Formats an Ethereum address for display by truncating the middle
 * @param address The Ethereum address to format
 * @param startChars Number of characters to show at the start
 * @param endChars Number of characters to show at the end
 * @returns The formatted address (e.g., "0x1234...5678")
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  
  const normalized = normalizeAddress(address);
  
  if (normalized.length <= startChars + endChars) {
    return normalized;
  }
  
  return `${normalized.slice(0, startChars)}...${normalized.slice(-endChars)}`;
}

/**
 * Validates if a string is a valid Ethereum address
 * @param address The string to validate
 * @returns True if the address is valid, false otherwise
 */
export function isValidAddress(address: string): boolean {
  if (!address) return false;
  
  // Basic validation: starts with 0x and has 42 characters (including 0x)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
