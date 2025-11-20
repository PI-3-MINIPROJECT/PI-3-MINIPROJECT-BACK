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

    const { name, last_name, age, email } = req.body;
    const db = getFirestoreInstance();
    const auth = getAuthInstance();

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Actualizar name
    if (name) {
      updateData.name = name;
    }

    // Actualizar last_name
    if (last_name) {
      updateData.last_name = last_name;
    }

    // Actualizar displayName en Firebase Auth si cambian name o last_name
    if (name || last_name) {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const newname = name || userData?.name || '';
      const newlast_name = last_name || userData?.last_name || '';
      await auth.updateUser(userId, { 
        displayName: `${newname} ${newlast_name}` 
      });
    }

    // Actualizar age
    if (age !== undefined) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        throw createError('La edad debe ser un número válido entre 1 y 120', 400);
      }
      updateData.age = ageNum;
    }

    // Actualizar email
    if (email) {
      updateData.email = email;
      // Update email in Firebase Auth
      await auth.updateUser(userId, { email });
    }

    await db.collection('users').doc(userId).update(updateData);

    const updatedUser = await db.collection('users').doc(userId).get();

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: updatedUser.id,
        ...updatedUser.data(),
      },
    });
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else if (error.code === 'auth/email-already-exists') {
      next(createError('El correo ya está en uso', 409));
    } else if (error.code === 'auth/invalid-email') {
      next(createError('El correo electrónico no es válido', 400));
    } else {
      next(createError('Error al actualizar el perfil', 500));
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

