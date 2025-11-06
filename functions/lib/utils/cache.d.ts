export declare class Cache<T> {
    private readonly defaultTTL;
    private cache;
    constructor(defaultTTL?: number);
    set(key: string, value: T, ttl?: number): void;
    get(key: string): T | null;
    delete(key: string): void;
    clear(): void;
    cleanup(): void;
}
export declare const plantCache: Cache<any>;
export declare const userCache: Cache<any>;
export declare const envDataCache: Cache<any>;
