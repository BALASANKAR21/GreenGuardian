type StorageType = 'local' | 'session';

interface StorageOptions {
  type?: StorageType;
  ttl?: number; // Time to live in milliseconds
}

interface CachedItem<T> {
  value: T;
  timestamp: number;
  expiry?: number;
}

class PersistenceService {
  private static instance: PersistenceService;

  private constructor() {}

  public static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }

  private getStorage(type: StorageType = 'local'): Storage {
    return type === 'local' ? localStorage : sessionStorage;
  }

  private getKey(key: string): string {
    return `green_guardian_${key}`;
  }

  public set<T>(
    key: string,
    value: T,
    options: StorageOptions = {}
  ): void {
    try {
      const { type = 'local', ttl } = options;
      const storage = this.getStorage(type);
      const timestamp = Date.now();
      const item: CachedItem<T> = {
        value,
        timestamp,
        expiry: ttl ? timestamp + ttl : undefined,
      };
      storage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  public get<T>(key: string, options: StorageOptions = {}): T | null {
    try {
      const { type = 'local' } = options;
      const storage = this.getStorage(type);
      const data = storage.getItem(this.getKey(key));
      
      if (!data) return null;
      
      const item: CachedItem<T> = JSON.parse(data);
      
      // Check if data has expired
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key, options);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  public remove(key: string, options: StorageOptions = {}): void {
    try {
      const { type = 'local' } = options;
      const storage = this.getStorage(type);
      storage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Error removing data:', error);
    }
  }

  public clear(options: StorageOptions = {}): void {
    try {
      const { type = 'local' } = options;
      const storage = this.getStorage(type);
      const keys = Object.keys(storage);
      
      // Only clear keys that belong to our app
      keys.forEach(key => {
        if (key.startsWith('green_guardian_')) {
          storage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  public has(key: string, options: StorageOptions = {}): boolean {
    try {
      const { type = 'local' } = options;
      const storage = this.getStorage(type);
      const item = storage.getItem(this.getKey(key));
      
      if (!item) return false;
      
      const cachedItem: CachedItem<any> = JSON.parse(item);
      
      // Check if data has expired
      if (cachedItem.expiry && Date.now() > cachedItem.expiry) {
        this.remove(key, options);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking data:', error);
      return false;
    }
  }

  public getTimestamp(key: string, options: StorageOptions = {}): number | null {
    try {
      const { type = 'local' } = options;
      const storage = this.getStorage(type);
      const data = storage.getItem(this.getKey(key));
      
      if (!data) return null;
      
      const item: CachedItem<any> = JSON.parse(data);
      return item.timestamp;
    } catch (error) {
      console.error('Error getting timestamp:', error);
      return null;
    }
  }

  public getTTL(key: string, options: StorageOptions = {}): number | null {
    try {
      const { type = 'local' } = options;
      const storage = this.getStorage(type);
      const data = storage.getItem(this.getKey(key));
      
      if (!data) return null;
      
      const item: CachedItem<any> = JSON.parse(data);
      
      if (!item.expiry) return null;
      
      const ttl = item.expiry - Date.now();
      return ttl > 0 ? ttl : null;
    } catch (error) {
      console.error('Error getting TTL:', error);
      return null;
    }
  }

  public updateTTL(
    key: string,
    ttl: number,
    options: StorageOptions = {}
  ): void {
    try {
      const { type = 'local' } = options;
      const data = this.get(key, { type });
      
      if (data) {
        this.set(key, data, { type, ttl });
      }
    } catch (error) {
      console.error('Error updating TTL:', error);
    }
  }
}

// Export singleton instance
export const persistenceService = PersistenceService.getInstance();