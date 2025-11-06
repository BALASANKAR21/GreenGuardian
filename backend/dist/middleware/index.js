import rateLimit from 'express-rate-limit';
import { ValidationError } from '../utils/errors';
// Rate limiting middleware
export const rateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes by default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per window by default
    message: { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' }
});
export const validateRequest = (schema) => {
    return (req, _res, next) => {
        const errors = [];
        for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field];
            if (rules.required && !value) {
                errors.push(`${field} is required`);
                continue;
            }
            if (value) {
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`${field} must be of type ${rules.type}`);
                }
                if (rules.min !== undefined && value < rules.min) {
                    errors.push(`${field} must be greater than or equal to ${rules.min}`);
                }
                if (rules.max !== undefined && value > rules.max) {
                    errors.push(`${field} must be less than or equal to ${rules.max}`);
                }
                if (rules.pattern && !rules.pattern.test(value)) {
                    errors.push(`${field} is invalid`);
                }
            }
        }
        if (errors.length > 0) {
            next(new ValidationError('Validation failed', errors));
        }
        else {
            next();
        }
    };
};
export const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);
    // Handle known error types
    if (err.status && err.code) {
        return res.status(err.status).json({
            error: err.message,
            code: err.code,
            details: err.details
        });
    }
    // Default to 500 server error
    res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
    });
};
// Request logging middleware
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
};
// CORS configuration
export const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
// Security headers middleware
export const securityHeaders = (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';");
    next();
};
