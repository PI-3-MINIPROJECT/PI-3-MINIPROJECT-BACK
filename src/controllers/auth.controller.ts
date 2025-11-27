import { Request, Response, NextFunction } from 'express';
import { getAuthInstance, getFirestoreInstance } from '../config/firebase';
import { createError } from '../middlewares/errorHandler';
import { OAuth2Client } from 'google-auth-library';

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
    const expiresIn = Number(process.env.SESSION_COOKIE_EXPIRES_IN_MS) || 5 * 24 * 60 * 60 * 1000;

    // Crear session cookie con Firebase Admin
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // Configurar opciones de la cookie
    const cookieOptions = {
      maxAge: expiresIn,
      httpOnly: true, // No accesible desde JavaScript (protege contra XSS)
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const), // Cross-site cookies
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

    const apiKey = process.env.FIREBASE_API_KEY;

    if (!apiKey) {
      return next(createError('Configuración del servidor incorrecta', 500));
    }

    // Usar Firebase REST API para enviar email de reset
    const resetResp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email: email,
        }),
      }
    );

    const resetData: any = await resetResp.json().catch(() => ({}));

    if (!resetResp.ok) {
      const errMsg: string = resetData?.error?.message || 'Error al enviar email';
      let friendlyMessage = 'Error al enviar el email de recuperación';
      
      if (errMsg === 'EMAIL_NOT_FOUND') {
        friendlyMessage = 'No existe una cuenta con este correo electrónico';
      }

      return next(createError(friendlyMessage, 400));
    }

    res.status(200).json({
      success: true,
      message: 'Se ha enviado un enlace de recuperación a tu correo electrónico',
      data: {
        email: resetData.email,
      },
    });
  } catch (error: any) {
    console.error('Error en resetPassword:', error);
    return next(createError(error?.message || 'Error al procesar la solicitud de recuperación', 500));
  }
};

/**
 * Confirm password reset with OOB code from email
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const confirmPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { oobCode, newPassword } = req.body;

    const apiKey = process.env.FIREBASE_API_KEY;

    if (!apiKey) {
      return next(createError('Configuración del servidor incorrecta', 500));
    }

    // Primero verificar que el código OOB es válido
    const verifyResp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oobCode: oobCode,
          newPassword: newPassword,
        }),
      }
    );

    const verifyData: any = await verifyResp.json().catch(() => ({}));

    if (!verifyResp.ok) {
      const errMsg: string = verifyData?.error?.message || 'Código inválido';
      let friendlyMessage = 'El enlace de recuperación es inválido o ha expirado';
      
      if (errMsg === 'INVALID_OOB_CODE') {
        friendlyMessage = 'El código de recuperación es inválido';
      } else if (errMsg === 'EXPIRED_OOB_CODE') {
        friendlyMessage = 'El enlace de recuperación ha expirado';
      } else if (errMsg === 'WEAK_PASSWORD') {
        friendlyMessage = 'La contraseña debe tener al menos 6 caracteres';
      }

      return next(createError(friendlyMessage, 400));
    }

    // Actualizar timestamp en Firestore si el usuario existe
    try {
      const db = getFirestoreInstance();
      const email = verifyData.email;
      
      if (email) {
        // Buscar usuario por email en Firestore
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();
        
        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          await userDoc.ref.update({
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (firestoreError) {
      // No fallar si hay error en Firestore, la contraseña ya se cambió en Auth
      console.warn('Error updating Firestore timestamp:', firestoreError);
    }

    res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente',
      data: {
        email: verifyData.email,
      },
    });
  } catch (error: any) {
    console.error('Error en confirmPasswordReset:', error);
    return next(createError(error?.message || 'Error al restablecer la contraseña', 500));
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
  /**
   * Server-side Google OAuth flow:
   * - If no "code" query param: generate Google consent URL and redirect user.
   * - If "code" present: exchange code for tokens, get Google profile,
   *   create or fetch Firebase user, mint Firebase custom token, exchange for idToken,
   *   create session cookie and set it, then redirect (or return JSON).
   *
   * Required env:
   * - GOOGLE_CLIENT_ID
   * - GOOGLE_CLIENT_SECRET
   * - OAUTH_CALLBACK_URL (this endpoint URL)
   * - FIREBASE_API_KEY
   * - FRONTEND_URL (optional; where to redirect after success/failure)
   */
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.OAUTH_CALLBACK_URL; // should point to this handler
    const apiKey = process.env.FIREBASE_API_KEY;
    const frontend = process.env.FRONTEND_URL || '/';

    if (!clientId || !clientSecret || !redirectUri) {
      return next(createError('Google OAuth not configured on server', 500));
    }

    const oauth2Client = new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri,
    });

    // If no code -> start flow by redirecting to Google's consent page
    const code = (req.query.code as string) || undefined;
    if (!code) {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['openid', 'profile', 'email'],
      });
      res.redirect(authUrl);
      return;
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    const idToken = tokens.id_token;
    if (!idToken) {
      return next(createError('Failed to obtain id_token from Google', 500));
    }

    // Verify id_token and get Google profile
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      return next(createError('Failed to verify Google id token', 500));
    }

    const googleId = payload.sub;
    const email = payload.email;
    const displayName = payload.name;
    const photoURL = payload.picture;
    const uid = `google:${googleId}`;

    const auth = getAuthInstance();
    const db = getFirestoreInstance();

    // Create or get firebase user
    try {
      await auth.getUser(uid);
    } catch (err: any) {
      // If user not found, try to create; on failure try to get by email
      if (err?.code === 'auth/user-not-found') {
        try {
          // Prefer to create a stable UID based on provider to avoid collisions
          await auth.createUser({
            uid,
            email,
            displayName,
            photoURL,
            emailVerified: true,
          });

          // create a basic user document in Firestore
          await db.collection('users').doc(uid).set({
            uid,
            email,
            name: displayName,
            last_name: '',
            age: null,
            provider: 'google',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (createErr: any) {
          // If UID already exists or other issue, try to fallback to getUserByEmail
          try {
            await auth.getUserByEmail(email);
          } catch {
            return next(createError('Error creating or fetching Firebase user', 500));
          }
        }
      } else {
        return next(createError('Error fetching Firebase user', 500));
      }
    }

    // Create a Firebase custom token for this uid
    const customToken = await auth.createCustomToken(uid);

    if (!apiKey) {
      return next(createError('Missing FIREBASE_API_KEY for token exchange', 500));
    }

    // Exchange custom token for idToken via Firebase REST API (server-side)
    const signInResp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      }
    );

    const signInData: any = await signInResp.json().catch(() => ({}));
    if (!signInResp.ok || !signInData.idToken) {
      console.error('Failed exchange custom token:', signInData);
      return next(createError('Failed to sign in with custom token', 500));
    }

    const firebaseIdToken = signInData.idToken;

    // Create session cookie
    const expiresIn = Number(process.env.SESSION_COOKIE_EXPIRES_IN_MS) || 5 * 24 * 60 * 60 * 1000;
    // Crear session cookie con Firebase Admin
    const sessionCookie = await auth.createSessionCookie(firebaseIdToken, { expiresIn });

    // Configurar opciones de la cookie
    const cookieOptions = {
      maxAge: expiresIn,
      httpOnly: true, // No accesible desde JavaScript (protege contra XSS)
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const), // Cross-site cookies
      path: '/',
    };

    // Establecer la cookie de sesión ANTES del redirect
    res.cookie('session', sessionCookie, cookieOptions);

    // Redirect to frontend con parámetro de éxito
    res.redirect(`${frontend}/login?oauth_success=true`);
    return;
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    // On error, attempt to redirect to frontend with an error query param (avoid exposing details)
    const frontend = process.env.FRONTEND_URL || '/';
    try {
      res.redirect(`${frontend}?oauth_error=1`);
    } catch {
      return next(createError(error?.message || 'Error during Google OAuth', 500));
    }
  }
};

/**
 * OAuth login with GitHub (Server-side flow - same as Google)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const githubOAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /**
   * Server-side GitHub OAuth flow (same pattern as Google):
   * - If no "code" query param: redirect user to GitHub authorization page
   * - If "code" present: exchange code for access token, get GitHub profile,
   *   create or fetch Firebase user, mint Firebase custom token, exchange for idToken,
   *   create session cookie and set it, then redirect to frontend
   *
   * Required env:
   * - GITHUB_CLIENT_ID
   * - GITHUB_CLIENT_SECRET
   * - GITHUB_CALLBACK_URL (this endpoint URL)
   * - FIREBASE_API_KEY
   * - FRONTEND_URL (optional; where to redirect after success/failure)
   */
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_CALLBACK_URL;
    const apiKey = process.env.FIREBASE_API_KEY;
    const frontend = process.env.FRONTEND_URL || '/';

    if (!clientId || !clientSecret || !redirectUri) {
      return next(createError('GitHub OAuth not configured on server', 500));
    }

    // Step 1: If no code -> redirect to GitHub authorization page
    const code = (req.query.code as string) || undefined;
    if (!code) {
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user user:email`;
      res.redirect(githubAuthUrl);
      return;
    }

    // Step 2: Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData: any = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('Failed to get GitHub access token:', tokenData);
      return next(createError('Failed to obtain access token from GitHub', 500));
    }

    // Step 3: Get GitHub user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    const githubUser: any = await userResponse.json();
    
    if (!githubUser.id) {
      return next(createError('Failed to get GitHub user profile', 500));
    }

    // Get user email (GitHub may require separate API call for email)
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
      const emails: any[] = await emailResponse.json();
      const primaryEmail = emails.find(e => e.primary && e.verified);
      email = primaryEmail?.email || emails[0]?.email;
    }

    if (!email) {
      return next(createError('No email found in GitHub account', 400));
    }

    const githubId = githubUser.id.toString();
    const displayName = githubUser.name || githubUser.login;
    const photoURL = githubUser.avatar_url;
    const uid = `github:${githubId}`;

    const auth = getAuthInstance();
    const db = getFirestoreInstance();

    // Step 4: Create or get Firebase user
    try {
      await auth.getUser(uid);
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        try {
          await auth.createUser({
            uid,
            email,
            displayName,
            photoURL,
            emailVerified: true,
          });

          // Create user document in Firestore
          await db.collection('users').doc(uid).set({
            uid,
            email,
            name: displayName,
            last_name: '',
            age: null,
            provider: 'github',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (createErr: any) {
          try {
            await auth.getUserByEmail(email);
          } catch {
            return next(createError('Error creating or fetching Firebase user', 500));
          }
        }
      } else {
        return next(createError('Error fetching Firebase user', 500));
      }
    }

    // Step 5: Create Firebase custom token
    const customToken = await auth.createCustomToken(uid);

    if (!apiKey) {
      return next(createError('Missing FIREBASE_API_KEY for token exchange', 500));
    }

    // Step 6: Exchange custom token for Firebase idToken
    const signInResp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      }
    );

    const signInData: any = await signInResp.json().catch(() => ({}));
    if (!signInResp.ok || !signInData.idToken) {
      console.error('Failed exchange custom token:', signInData);
      return next(createError('Failed to sign in with custom token', 500));
    }

    const firebaseIdToken = signInData.idToken;

    // Step 7: Create session cookie
    const expiresIn = Number(process.env.SESSION_COOKIE_EXPIRES_IN_MS) || 5 * 24 * 60 * 60 * 1000;
    const sessionCookie = await auth.createSessionCookie(firebaseIdToken, { expiresIn });

    const cookieOptions = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
      path: '/',
    };

    // Set session cookie
    res.cookie('session', sessionCookie, cookieOptions);

    // Step 8: Redirect to frontend with success
    res.redirect(`${frontend}/login?oauth_success=true`);
    return;
  } catch (error: any) {
    console.error('GitHub OAuth error:', error);
    const frontend = process.env.FRONTEND_URL || '/';
    try {
      res.redirect(`${frontend}?oauth_error=1`);
    } catch {
      return next(createError(error?.message || 'Error during GitHub OAuth', 500));
    }
  }
};

/**
 * Update user password
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?.uid;

    if (!userId) {
      return next(createError('Usuario no autenticado', 401));
    }

    const auth = getAuthInstance();
    const db = getFirestoreInstance();
    const apiKey = process.env.FIREBASE_API_KEY;

    if (!apiKey) {
      return next(createError('Configuración del servidor incorrecta', 500));
    }
    
    // Obtener datos del usuario de Firestore para verificar email
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData || !userData.email) {
      return next(createError('Usuario no encontrado', 404));
    }

    // Verificar contraseña actual autenticando con Firebase
    const verifyResp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: currentPassword,
          returnSecureToken: true,
        }),
      }
    );

    const verifyData: any = await verifyResp.json().catch(() => ({}));

    if (!verifyResp.ok) {
      const errMsg: string = verifyData?.error?.message || 'Contraseña incorrecta';
      let friendlyMessage = 'La contraseña actual es incorrecta';
      
      if (errMsg === 'INVALID_PASSWORD' || errMsg === 'INVALID_LOGIN_CREDENTIALS') {
        friendlyMessage = 'La contraseña actual es incorrecta';
      }

      return next(createError(friendlyMessage, 400));
    }

    // Actualizar contraseña en Firebase Auth
    await auth.updateUser(userId, {
      password: newPassword,
    });

    // Actualizar timestamp en Firestore
    await db.collection('users').doc(userId).update({
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al actualizar contraseña:', error);
    
    if (error.code === 'auth/user-not-found') {
      return next(createError('Usuario no encontrado', 404));
    }
    
    if (error.code === 'auth/weak-password') {
      return next(createError('La nueva contraseña debe tener al menos 6 caracteres', 400));
    }

    return next(createError(error?.message || 'Error al actualizar la contraseña', 500));
  }
};

