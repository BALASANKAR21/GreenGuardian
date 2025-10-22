// Base error class for the application
export class AppError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details?: unknown): AppError {
    return new AppError(message, 400, code, details);
  }

  static unauthorized(message: string, code = 'UNAUTHORIZED', details?: unknown): AppError {
    return new AppError(message, 401, code, details);
  }

  static notFound(message: string, code = 'NOT_FOUND', details?: unknown): AppError {
    return new AppError(message, 404, code, details);
  }

  static forbidden(message: string, code = 'FORBIDDEN', details?: unknown): AppError {
    return new AppError(message, 403, code, details);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR', details?: unknown): AppError {
    return new AppError(message, 500, code, details);
  }

  static validation(message: string, code = 'VALIDATION_ERROR', details?: unknown): AppError {
    return new AppError(message, 400, code, details);
  }

  static databaseError(message: string, originalError?: Error): AppError {
    return new AppError(
      message,
      503,
      'DATABASE_ERROR',
      originalError?.message
    );
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 503, 'DATABASE_ERROR', originalError?.message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}