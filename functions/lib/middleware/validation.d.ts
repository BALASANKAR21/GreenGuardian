import { NextFunction, Request, Response } from 'express';
import { Schema } from 'joi';
export declare const validateSchema: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void;
