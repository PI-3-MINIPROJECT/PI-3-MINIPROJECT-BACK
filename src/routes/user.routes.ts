import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../utils/validation';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Los nombres no pueden estar vacíos')
      .isLength({ min: 2, max: 50 })
      .withMessage('Los nombres deben tener entre 2 y 50 caracteres'),
    body('last_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Los apellidos no pueden estar vacíos')
      .isLength({ min: 2, max: 50 })
      .withMessage('Los apellidos deben tener entre 2 y 50 caracteres'),
    body('age')
      .optional()
      .isInt({ min: 1, max: 120 })
      .withMessage('La edad debe ser un número entre 1 y 120'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Debe proporcionar un correo electrónico válido'),
  ],
  validateRequest,
  userController.updateProfile
);

/**
 * @route   DELETE /api/users/profile
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/profile', userController.deleteAccount);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:userId', userController.getUserById);

export default router;

