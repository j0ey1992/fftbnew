/**
 * Quest Data Caching Service
 * Provides efficient caching for quest data to reduce API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class QuestCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly QUEST_LIST_TTL = 2 * 60 * 1000; // 2 minutes for lists
  private readonly QUEST_DETAIL_TTL = 10 * 60 * 1000; // 10 minutes for details

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    });
  }

  /**
   * Clear specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries matching a pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cache key generators
   */
  static questListKey(filters?: Record<string, any>): string {
    const filterStr = filters ? JSON.stringify(filters) : 'all';
    return `quests:list:${filterStr}`;
  }

  static questDetailKey(questId: string): string {
    return `quests:detail:${questId}`;
  }

  static userQuestsKey(userId: string, status?: string): string {
    return `quests:user:${userId}:${status || 'all'}`;
  }

  static submissionsKey(questId: string): string {
    return `quests:submissions:${questId}`;
  }

  static userSubmissionsKey(userId: string): string {
    return `quests:user-submissions:${userId}`;
  }
}

// Create singleton instance
export const questCache = new QuestCache();

// Set up periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    questCache.cleanup();
  }, 60 * 1000); // Run cleanup every minute
}

// Cache wrapper for async functions
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = questCache.get<T>(key);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  // Fetch and cache
  return fetcher().then(data => {
    questCache.set(key, data, ttl);
    return data;
  });
}

// React hook for cached data
import { useEffect, useState } from 'react';

export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cached = questCache.get<T>(key);
        if (cached !== null && !cancelled) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        const freshData = await fetcher();
        
        if (!cancelled) {
          questCache.set(key, freshData, ttl);
          setData(freshData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [key, ...dependencies]);

  const invalidate = () => {
    questCache.invalidate(key);
    // Re-run effect by updating a dummy state
    setData(null);
  };

  return { data, loading, error, invalidate };
}

// Prefetch helper
export async function prefetchQuest(questId: string): Promise<void> {
  const key = QuestCache.questDetailKey(questId);
  const cached = questCache.get(key);
  
  if (!cached) {
    try {
      const response = await fetch(`/api/quests/${questId}`);
      if (response.ok) {
        const data = await response.json();
        questCache.set(key, data, questCache.QUEST_DETAIL_TTL);
      }
    } catch (error) {
      console.error('Error prefetching quest:', error);
    }
  }
}

// Export cache TTL constants for external use
export const CACHE_TTL = {
  DEFAULT: 5 * 60 * 1000,
  QUEST_LIST: 2 * 60 * 1000,
  QUEST_DETAIL: 10 * 60 * 1000,
  USER_DATA: 3 * 60 * 1000
};