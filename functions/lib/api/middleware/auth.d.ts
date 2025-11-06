import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user: {
        uid: string;
        email?: string;
        role?: string;
        displayName?: string;
        emailVerified: boolean;
    };
}
export declare function authenticate(req: Request): Promise<AuthenticatedRequest>;
export declare const authenticateMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
