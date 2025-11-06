export class AppError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string): AppError {
    return new AppError(message, 400);
  }

  static notFound(message: string): AppError {
    return new AppError(message, 404);
  }

  static unauthorized(message: string): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message: string): AppError {
    return new AppError(message, 403);
  }

  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, 500);
  }
}