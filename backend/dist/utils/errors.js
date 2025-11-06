export class AppError extends Error {
    status;
    code;
    details;
    constructor(message, status = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        const base = {
            error: this.message,
            code: this.code
        };
        if (this.details)
            base.details = this.details;
        return base;
    }
}
export class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}
export class AuthError extends AppError {
    constructor(message) {
        super(message, 401, 'AUTH_ERROR');
    }
}
export class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404, 'NOT_FOUND');
    }
}
export class DatabaseError extends AppError {
    constructor(message, originalError) {
        super(message, 503, 'DATABASE_ERROR', originalError ? { message: originalError.message } : undefined);
    }
}
