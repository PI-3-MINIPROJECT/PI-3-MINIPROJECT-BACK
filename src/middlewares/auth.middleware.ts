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
 * Authentication middleware to verify session cookies
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener la session cookie
    const sessionCookie = req.cookies.session;

    if (!sessionCookie) {
      throw createError('No hay sesión activa. Por favor inicia sesión.', 401);
    }

    const auth = getAuthInstance();
    
    // Verificar la session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    
    // Adjuntar información del usuario al request
    req.user = {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      name: decodedClaims.name,
    };

    next();
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else if (error.code === 'auth/session-cookie-expired') {
      next(createError('Sesión expirada. Por favor inicia sesión nuevamente.', 401));
    } else if (error.code === 'auth/session-cookie-revoked') {
      next(createError('Sesión revocada. Por favor inicia sesión nuevamente.', 401));
    } else {
      next(createError('Sesión inválida o expirada', 401));
    }
  }
};

