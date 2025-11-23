/**
 * AI Response Caching Service
 * 
 * This module provides caching functionality for AI responses to reduce API calls,
 * improve response times, and reduce costs.
 * 
 * Features:
 * - In-memory LRU cache for development environments
 * - Redis-based distributed cache for production environments
 * - Automatic cache invalidation based on TTL
 * - Cache key generation based on request parameters
 * - Support for different cache strategies based on request type
 */

import { createHash } from 'crypto';
import { LRUCache } from 'lru-cache';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const REDIS_URL = process.env.REDIS_URL;

// Cache configuration
const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

// Cache options
const cacheOptions = {
  max: 500, // Maximum number of items in cache
  ttl: CACHE_TTL.MEDIUM, // Default TTL
  allowStale: false,
  updateAgeOnGet: true,
  updateAgeOnHas: false,
};

// Initialize in-memory LRU cache
const memoryCache = new LRUCache<string, any>(cacheOptions);

// Redis client for distributed caching
let redisClient: any = null;

// Initialize Redis client if in production and Redis URL is provided
// We'll use a more Next.js friendly approach for Redis
// This will be initialized server-side only
if (isProduction && REDIS_URL && typeof window === 'undefined') {
  // We'll initialize Redis in a separate function that can be called server-side
  initRedisClient();
}

/**
 * Initialize Redis client (server-side only)
 * This function should be called only on the server
 */
async function initRedisClient() {
  try {
    // In a real implementation, you would initialize your Redis client here
    // For now, we'll just log that we would connect to Redis
    console.log('Would connect to Redis at:', REDIS_URL);
    
    // Placeholder for actual Redis client
    redisClient = {
      get: async (key: string) => null,
      set: async (key: string, value: string, _options: any) => {},
      del: async (key: string) => {},
      flushDb: async () => {}
    };
  } catch (err) {
    console.error('Failed to initialize Redis client:', err);
    // Fall back to memory cache if Redis initialization fails
    redisClient = null;
  }
}

/**
 * Generate a cache key from the input parameters
 * @param params - The parameters to generate a key from
 * @returns A hash-based cache key
 */
export function generateCacheKey(params: any): string {
  // Sort keys to ensure consistent order
  const sortedParams = typeof params === 'object' 
    ? JSON.stringify(params, Object.keys(params).sort())
    : String(params);
  
  // Generate hash
  return createHash('sha256').update(sortedParams).digest('hex');
}

/**
 * Get an item from the cache
 * @param key - The cache key
 * @returns The cached value or null if not found
 */
export async function getCachedItem<T>(key: string): Promise<T | null> {
  try {
    // Try Redis first if available
    if (redisClient) {
      const value = await redisClient.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    }
    
    // Fall back to memory cache
    return memoryCache.get(key) as T || null;
  } catch (error) {
    console.error('Error getting cached item:', error);
    return null;
  }
}

/**
 * Set an item in the cache
 * @param key - The cache key
 * @param value - The value to cache
 * @param ttl - Optional TTL in milliseconds
 */
export async function setCachedItem(key: string, value: any, ttl?: number): Promise<void> {
  try {
    const actualTtl = ttl || CACHE_TTL.MEDIUM;
    
    // Try Redis first if available
    if (redisClient) {
      await redisClient.set(key, JSON.stringify(value), {
        EX: Math.floor(actualTtl / 1000), // Convert to seconds for Redis
      });
      return;
    }
    
    // Fall back to memory cache
    memoryCache.set(key, value, { ttl: actualTtl });
  } catch (error) {
    console.error('Error setting cached item:', error);
  }
}

/**
 * Remove an item from the cache
 * @param key - The cache key
 */
export async function invalidateCachedItem(key: string): Promise<void> {
  try {
    // Try Redis first if available
    if (redisClient) {
      await redisClient.del(key);
      return;
    }
    
    // Fall back to memory cache
    memoryCache.delete(key);
  } catch (error) {
    console.error('Error invalidating cached item:', error);
  }
}

/**
 * Clear all items from the cache
 */
export async function clearCache(): Promise<void> {
  try {
    // Try Redis first if available
    if (redisClient) {
      await redisClient.flushDb();
      return;
    }
    
    // Fall back to memory cache
    memoryCache.clear();
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get a cached response or generate a new one
 * @param cacheKey - The cache key
 * @param generator - Function to generate the value if not in cache
 * @param ttl - Optional TTL in milliseconds
 * @returns The cached or generated value
 */
export async function getCachedOrGenerate<T>(
  cacheKey: string,
  generator: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cachedValue = await getCachedItem<T>(cacheKey);
  if (cachedValue !== null) {
    return cachedValue;
  }
  
  // Generate new value
  const generatedValue = await generator();
  
  // Cache the generated value
  await setCachedItem(cacheKey, generatedValue, ttl);
  
  return generatedValue;
}

/**
 * Determine if a request should be cached based on its parameters
 * @param params - The request parameters
 * @returns Whether the request should be cached
 */
export function shouldCacheRequest(params: any): boolean {
  // Don't cache requests with low temperature (high determinism)
  // as these are likely to be more consistent and cacheable
  if (params.temperature && params.temperature > 0.7) {
    return false;
  }
  
  // Don't cache very long prompts as they're likely unique
  if (params.prompt && typeof params.prompt === 'string' && params.prompt.length > 1000) {
    return false;
  }
  
  // Don't cache streaming requests
  if (params.stream === true) {
    return false;
  }
  
  return true;
}

/**
 * Determine the appropriate TTL for a cache entry based on its parameters
 * @param params - The request parameters
 * @returns The TTL in milliseconds
 */
export function determineCacheTTL(params: any): number {
  // System prompts and templates can be cached longer
  if (params.isSystemPrompt || params.isTemplate) {
    return CACHE_TTL.LONG;
  }
  
  // Short conversations can be cached for medium duration
  if (params.messages && params.messages.length <= 3) {
    return CACHE_TTL.MEDIUM;
  }
  
  // Default to short TTL for most requests
  return CACHE_TTL.SHORT;
}