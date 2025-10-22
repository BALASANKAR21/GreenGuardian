export declare class AppError extends Error {
    status: number;
    code: string;
    details?: unknown | undefined;
    constructor(message: string, status?: number, code?: string, details?: unknown | undefined);
    static badRequest(message: string, code?: string, details?: unknown): AppError;
    static unauthorized(message: string, code?: string, details?: unknown): AppError;
    static notFound(message: string, code?: string, details?: unknown): AppError;
    static forbidden(message: string, code?: string, details?: unknown): AppError;
    static internal(message?: string, code?: string, details?: unknown): AppError;
    static validation(message: string, code?: string, details?: unknown): AppError;
    static databaseError(message: string, originalError?: Error): AppError;
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: unknown);
}
export declare class AuthError extends AppError {
    constructor(message: string);
}
export declare class DatabaseError extends AppError {
    constructor(message: string, originalError?: Error);
}
export declare class NotFoundError extends AppError {
    constructor(message: string, code?: string);
}
