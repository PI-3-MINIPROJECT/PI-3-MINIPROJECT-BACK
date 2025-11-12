import { Request, Response, NextFunction } from 'express';
import { getAuthInstance, getFirestoreInstance } from '../config/firebase';
import { createError } from '../middlewares/errorHandler';

/**
 * Register a new user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const auth = getAuthInstance();
    const db = getFirestoreInstance();

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
      },
    });
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      next(createError('Email already registered', 409));
    } else {
      next(createError('Error registering user', 500));
    }
  }
};

/**
 * Login user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Note: Firebase Admin SDK doesn't have a login method
    // Authentication should be handled on the client side with Firebase Auth
    // This endpoint can be used for validation or custom token generation if needed
    
    res.status(200).json({
      success: true,
      message: 'Login should be handled on client side with Firebase Auth',
      note: 'Use Firebase Auth SDK on client to authenticate and get ID token',
    });
  } catch (error: any) {
    next(createError('Error during login', 500));
  }
};

/**
 * Logout user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Logout is typically handled on the client side
    // This endpoint can be used for server-side cleanup if needed
    
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error: any) {
    next(createError('Error during logout', 500));
  }
};

/**
 * Request password reset
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const auth = getAuthInstance();
    
    // Generate password reset link
    const link = await auth.generatePasswordResetLink(email);

    // In production, send this link via email
    // For now, we'll return it (remove in production)
    res.status(200).json({
      success: true,
      message: 'Password reset link generated',
      // Remove this in production - send via email instead
      resetLink: link,
    });
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      next(createError('User not found', 404));
    } else {
      next(createError('Error generating reset link', 500));
    }
  }
};

/**
 * OAuth login with Google
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const googleOAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // OAuth is typically handled on the client side with Firebase Auth
    // This endpoint can be used for server-side verification or user creation
    
    res.status(200).json({
      success: true,
      message: 'Google OAuth should be handled on client side with Firebase Auth',
    });
  } catch (error: any) {
    next(createError('Error during Google OAuth', 500));
  }
};

/**
 * OAuth login with GitHub
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const githubOAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // OAuth is typically handled on the client side with Firebase Auth
    // This endpoint can be used for server-side verification or user creation
    
    res.status(200).json({
      success: true,
      message: 'GitHub OAuth should be handled on client side with Firebase Auth',
    });
  } catch (error: any) {
    next(createError('Error during GitHub OAuth', 500));
  }
};

