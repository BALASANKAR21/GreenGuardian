import { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin';
import { AuthenticationError } from '@/core/errors';

export interface AuthenticatedRequest extends Request {
  user: {
    uid: string;
    email?: string;
    role?: string;
    displayName?: string;
    emailVerified: boolean;
  };
}

export async function authenticate(
  req: Request
): Promise<AuthenticatedRequest> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('No token provided');
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(token);
    
    // Get additional user data
    const userRecord = await auth().getUser(decodedToken.uid);
    
    (req as AuthenticatedRequest).user = {
      uid: userRecord.uid,
      email: userRecord.email,
      role: userRecord.customClaims?.role,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified
    };
    
    return req as AuthenticatedRequest;
  } catch (error) {
    console.error('Authentication error:', error);
    throw new AuthenticationError('Invalid token');
  }
}

export const authenticateMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authenticate(req);
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    
    if (!user || !user.role || !roles.includes(user.role)) {
      next(new AuthenticationError('Insufficient permissions'));
      return;
    }
    
    next();
  };
};