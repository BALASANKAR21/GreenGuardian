interface RateLimitConfig {
    windowMs: number;
    max: number;
}
export declare const rateLimiter: (config: RateLimitConfig) => import("express-rate-limit").RateLimitRequestHandler;
export {};
