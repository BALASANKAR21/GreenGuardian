import { Request, Response } from 'express';
export interface TypedRequestBody<T> extends Request {
    body: T;
}
export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}
export type ApiHandler<T = any> = (req: Request, res: Response<ApiResponse<T>>) => Promise<void> | void;
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}
export type CloudFunction = any;
