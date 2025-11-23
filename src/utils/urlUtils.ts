/**
 * Validates if a string is a valid URL
 * @param url The string to validate
 * @returns True if the URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extracts the domain from a URL
 * @param url The URL to extract the domain from
 * @returns The domain or empty string if invalid
 */
export function extractDomain(url: string): string {
  if (!isValidUrl(url)) return '';
  
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch (error) {
    return '';
  }
}

/**
 * Checks if a URL is from a specific domain
 * @param url The URL to check
 * @param domain The domain to check against
 * @returns True if the URL is from the specified domain
 */
export function isUrlFromDomain(url: string, domain: string): boolean {
  if (!url || !domain) return false;
  
  try {
    const urlDomain = extractDomain(url);
    return urlDomain.includes(domain) || domain.includes(urlDomain);
  } catch (error) {
    return false;
  }
}
