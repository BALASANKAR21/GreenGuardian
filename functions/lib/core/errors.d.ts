export declare class AppError extends Error {
    statusCode: number;
    code: string;
    details?: Record<string, any> | undefined;
    constructor(message: string, statusCode?: number, code?: string, details?: Record<string, any> | undefined);
    toJSON(): {
        details?: Record<string, any> | undefined;
        status: string;
        code: string;
        message: string;
    };
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, any>);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
