import { Request, Response, NextFunction } from 'express';
import { getAuthInstance, getFirestoreInstance } from '../config/firebase';
import { createError } from '../middlewares/errorHandler';

/**
 * Get current user profile
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const db = getFirestoreInstance();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw createError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: userDoc.id,
        ...userDoc.data(),
      },
    });
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError('Error fetching user profile', 500));
    }
  }
};

/**
 * Update user profile
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const { name, email } = req.body;
    const db = getFirestoreInstance();
    const auth = getAuthInstance();

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name) {
      updateData.name = name;
      // Update display name in Firebase Auth
      await auth.updateUser(userId, { displayName: name });
    }

    if (email) {
      updateData.email = email;
      // Update email in Firebase Auth
      await auth.updateUser(userId, { email });
    }

    await db.collection('users').doc(userId).update(updateData);

    const updatedUser = await db.collection('users').doc(userId).get();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        ...updatedUser.data(),
      },
    });
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else if (error.code === 'auth/email-already-exists') {
      next(createError('Email already in use', 409));
    } else {
      next(createError('Error updating profile', 500));
    }
  }
};

/**
 * Delete user account
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const db = getFirestoreInstance();
    const auth = getAuthInstance();

    // Delete user document from Firestore
    await db.collection('users').doc(userId).delete();

    // Delete user from Firebase Auth
    await auth.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError('Error deleting account', 500));
    }
  }
};

/**
 * Get user by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const db = getFirestoreInstance();

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw createError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: userDoc.id,
        ...userDoc.data(),
      },
    });
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError('Error fetching user', 500));
    }
  }
};

