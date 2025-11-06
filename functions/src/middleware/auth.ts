import { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin';
import { AppError } from './error-handler';

export const authenticateMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(token);

    // Attach the user to the request
    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'user'
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Authentication failed', 401, 'UNAUTHORIZED');
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user || !user.role) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    if (!roles.includes(user.role)) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    next();
  };
};