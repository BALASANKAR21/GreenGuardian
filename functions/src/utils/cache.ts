interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export class Cache<T> {
  private cache: Map<string, CacheItem<T>>;

  constructor(private readonly defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
  }

  set(key: string, value: T, ttl: number = this.defaultTTL): void {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Create cache instances for different types of data
export const plantCache = new Cache<any>(15 * 60 * 1000); // 15 minutes
export const userCache = new Cache<any>(5 * 60 * 1000);  // 5 minutes
export const envDataCache = new Cache<any>(1 * 60 * 1000); // 1 minute

// Automatic cleanup every 5 minutes
setInterval(() => {
  plantCache.cleanup();
  userCache.cleanup();
  envDataCache.cleanup();
}, 5 * 60 * 1000);