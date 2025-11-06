import rateLimit from 'express-rate-limit';

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export const rateLimiter = (config: RateLimitConfig) =>
  rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: {
      status: 'error',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  });