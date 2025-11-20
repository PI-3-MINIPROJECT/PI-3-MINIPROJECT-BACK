import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../utils/validation';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Debe proporcionar un correo electrónico válido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Los nombres son obligatorios')
      .isLength({ min: 2, max: 50 })
      .withMessage('Los nombres deben tener entre 2 y 50 caracteres'),
    body('last_name')
      .trim()
      .notEmpty()
      .withMessage('Los apellidos son obligatorios')
      .isLength({ min: 2, max: 50 })
      .withMessage('Los apellidos deben tener entre 2 y 50 caracteres'),
    body('age')
      .isInt({ min: 1, max: 120 })
      .withMessage('La edad debe ser un número entre 1 y 120'),
  ],
  validateRequest,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password (creates session cookie)
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Debe proporcionar un correo electrónico válido'),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida'),
  ],
  validateRequest,
  authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clears session cookie)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/reset-password',
  [body('email').isEmail().normalizeEmail()],
  validateRequest,
  authController.resetPassword
);

/**
 * @route   POST /api/auth/oauth/google
 * @desc    OAuth login with Google
 * @access  Public
 */
router.get('/oauth/google', authController.googleOAuth);

/**
 * @route   POST /api/auth/oauth/github
 * @desc    OAuth login with GitHub
 * @access  Public
 */
router.post('/oauth/github', authController.facebookOAuth);

export default router;

