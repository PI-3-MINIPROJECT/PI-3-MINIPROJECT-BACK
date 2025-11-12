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
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
  ],
  validateRequest,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
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
router.post('/oauth/google', authController.googleOAuth);

/**
 * @route   POST /api/auth/oauth/github
 * @desc    OAuth login with GitHub
 * @access  Public
 */
router.post('/oauth/github', authController.githubOAuth);

export default router;

