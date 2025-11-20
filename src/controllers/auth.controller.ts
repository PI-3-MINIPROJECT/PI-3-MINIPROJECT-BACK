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
    const { email, password, name, last_name, age } = req.body;

    const auth = getAuthInstance();
    const db = getFirestoreInstance();

    // Validar edad
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return next(createError('La edad debe ser un número válido entre 1 y 120', 400));
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${name} ${last_name}`,
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      last_name,
      age: ageNum,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        name,
        last_name,
        age: ageNum,
      },
    });
  } catch (error: any) {
    console.error("🔥 Firebase error:", error);

    if (error.code === 'auth/email-already-exists') {
      return next(createError('El correo ya está registrado', 409));
    }

    if (error.code === 'auth/invalid-email') {
      return next(createError('El correo electrónico no es válido', 400));
    }

    if (error.code === 'auth/weak-password') {
      return next(createError('La contraseña debe tener al menos 6 caracteres', 400));
    }

    return next(createError(error.message || 'Error al registrar usuario', 500));
}
};

/**
 * Login user with email and password
 * Creates a session cookie for authentication
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

    // Validar que se proporcionen email y password
    if (!email || !password) {
      return next(createError('Email y contraseña son requeridos', 400));
    }

    const auth = getAuthInstance();
    const db = getFirestoreInstance();
    const apiKey = process.env.FIREBASE_API_KEY;

    if (!apiKey) {
      return next(createError('Configuración del servidor incorrecta', 500));
    }

    // Autenticar con Firebase usando REST API
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
      const errMsg: string = data?.error?.message || 'Autenticación fallida';
      let friendlyMessage = 'Error de autenticación';
      
      if (errMsg === 'EMAIL_NOT_FOUND') {
        friendlyMessage = 'Usuario no encontrado';
      } else if (errMsg === 'INVALID_PASSWORD') {
        friendlyMessage = 'Contraseña incorrecta';
      } else if (errMsg === 'USER_DISABLED') {
        friendlyMessage = 'Usuario deshabilitado';
      } else if (errMsg === 'INVALID_LOGIN_CREDENTIALS') {
        friendlyMessage = 'Credenciales de inicio de sesión inválidas';
      }

      return next(createError(friendlyMessage, 401));
    }

    const idToken = data.idToken;
    const uid = data.localId;

    // Obtener datos del usuario de Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    // Configurar duración de la cookie de sesión (5 días)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días en milisegundos

    // Crear session cookie con Firebase Admin
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // Configurar opciones de la cookie
    const cookieOptions = {
      maxAge: expiresIn,
      httpOnly: true, // No accesible desde JavaScript (protege contra XSS)
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax' as const, // Protección CSRF
      path: '/',
    };

    // Establecer la cookie de sesión
    res.cookie('session', sessionCookie, cookieOptions);

    // Responder con datos del usuario
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        uid: uid,
        email: data.email,
        name: userData?.name,
        last_name: userData?.last_name,
        age: userData?.age,
      },
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    return next(createError(error?.message || 'Error durante el inicio de sesión', 500));
  }
};

/**
 * Logout user - clears session cookie
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
    const sessionCookie = req.cookies.session;

    if (!sessionCookie) {
      return next(createError('No hay sesión activa', 400));
    }

    const auth = getAuthInstance();

    // Verificar y obtener el UID del usuario
    const decodedClaims = await auth.verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;

    // Revocar todos los refresh tokens del usuario
    await auth.revokeRefreshTokens(uid);

    // Limpiar la cookie de sesión
    res.clearCookie('session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Cierre de sesión exitoso',
    });
  } catch (error: any) {
    console.error('Error en logout:', error);
    
    // Limpiar la cookie incluso si hay error
    res.clearCookie('session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return next(createError(error?.message || 'Error durante el cierre de sesión', 500));
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
  _req: Request,
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
  _req: Request,
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

