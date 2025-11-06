import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
export declare const validateSchema: (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
