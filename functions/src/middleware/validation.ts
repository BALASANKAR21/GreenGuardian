import { NextFunction, Request, Response } from 'express';
import { Schema } from 'joi';
import { AppError } from './error-handler';

export const validateSchema = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      throw new AppError(errorMessage, 400, 'VALIDATION_ERROR');
    }

    next();
  };
};