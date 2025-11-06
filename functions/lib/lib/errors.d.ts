export declare class AppError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode?: number);
    static badRequest(message: string): AppError;
    static notFound(message: string): AppError;
    static unauthorized(message: string): AppError;
    static forbidden(message: string): AppError;
    static internal(message?: string): AppError;
}
