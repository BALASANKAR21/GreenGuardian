import { Request, Response, NextFunction } from 'express';
export declare const authenticateMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
