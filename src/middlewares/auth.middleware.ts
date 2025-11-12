import { Request, Response, NextFunction } from 'express';
import { getAuthInstance } from '../config/firebase';
import { createError } from './errorHandler';

/**
 * Extend Express Request to include user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        name?: string;
      };
    }
  }
}

/**
 * Authentication middleware to verify Firebase ID tokens
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No authorization token provided', 401);
    }

    const idToken = authHeader.split('Bearer ')[1];
    const auth = getAuthInstance();
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Attach user information to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };

    next();
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError('Invalid or expired token', 401));
    }
  }
};

