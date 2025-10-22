import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/core/errors';
import { MongoError } from 'mongodb';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  // Handle AppError and its subclasses
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle MongoDB errors
  if (error instanceof MongoError) {
    const statusCode = error.code === 11000 ? 409 : 500;
    return res.status(statusCode).json({
      status: 'error',
      code: error.code === 11000 ? 'DUPLICATE_ERROR' : 'DATABASE_ERROR',
      message: error.code === 11000 
        ? 'A duplicate record already exists' 
        : 'A database error occurred'
    });
  }

  // Handle validation errors (e.g., from express-validator)
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: error.message
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired token'
    });
  }

  // Handle syntax errors
  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    return res.status(400).json({
      status: 'error',
      code: 'INVALID_JSON',
      message: 'Invalid JSON payload'
    });
  }

  // Default error response for unhandled errors
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message
  });
};