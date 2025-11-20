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
    console.error("🔥 Firebase error:", error);

    if (error.code === 'auth/email-already-exists') {
      return next(createError('Email already registered', 409));
    }

    return next(createError(error.message || 'Error registering user', 500));
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
    const { email, password, idToken } = req.body as {
      email?: string;
      password?: string;
      idToken?: string;
    };

    const auth = getAuthInstance();

    // Preferred: client provides an ID token — verify it server-side
    if (typeof idToken === 'string' && idToken.trim()) {
      try {
        const decoded = await auth.verifyIdToken(idToken);
        const userRecord = await auth.getUser(decoded.uid);

        res.status(200).json({
          success: true,
          message: 'Token verified',
          data: {
            uid: userRecord.uid,
            email: userRecord.email,
            name: userRecord.displayName,
          },
        });
        return;
      } catch (err: any) {
        // token invalid / expired
        return next(createError('Invalid or expired ID token', 401));
      }
    }

    // Fallback: server-side email/password sign-in via Firebase REST API
    if (typeof email === 'string' && typeof password === 'string') {
      const apiKey = process.env.FIREBASE_API_KEY;
      if (!apiKey) return next(createError('Server missing FIREBASE_API_KEY', 500));

      const resp = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data: any = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        const errMsg: string = data?.error?.message || 'Authentication failed';
        const authErrors = ['EMAIL_NOT_FOUND', 'INVALID_PASSWORD', 'USER_DISABLED'];
        const status = authErrors.includes(errMsg) ? 401 : 400;
        return next(createError(errMsg, status));
      }

      // Successful sign-in: return tokens (client should store securely)
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          uid: data.localId,
          email: data.email,
          idToken: data.idToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        },
      });
      return;
    }

    return next(createError('Provide idToken or email and password', 400));
  } catch (error: any) {
    console.error('Login error:', error);
    return next(createError(error?.message || 'Error during login', 500));
  }
};

/**
 * Logout user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
// ...existing code...
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idToken, uid } = req.body as { idToken?: string; uid?: string };
    const auth = getAuthInstance();

    // Determine target UID: prefer explicit uid, otherwise verify provided idToken
    let targetUid = uid;
    if (!targetUid) {
      if (typeof idToken !== 'string' || !idToken.trim()) {
        return next(createError('Provide idToken or uid to logout', 400));
      }
      try {
        const decoded = await auth.verifyIdToken(idToken);
        targetUid = decoded.uid;
      } catch (err: any) {
        return next(createError('Invalid or expired ID token', 401));
      }
    }

    // Revoke refresh tokens so existing sessions are invalidated
    await auth.revokeRefreshTokens(targetUid);

    // Optionally clear session cookie if your app uses one
    try {
      res.clearCookie && res.clearCookie('session'); // no-op if not used
    } catch {}

    const userRecord = await auth.getUser(targetUid);

    res.status(200).json({
      success: true,
      message: 'Logout successful — refresh tokens revoked',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        // tokensValidAfterTime is a string timestamp set when tokens were revoked
        tokensValidAfterTime: userRecord.tokensValidAfterTime,
      },
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return next(createError(error?.message || 'Error during logout', 500));
  }
};
// ...existing code...

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

