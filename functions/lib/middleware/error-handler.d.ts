import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare const errorHandler: (error: Error | AppError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
