import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { createError } from '../middlewares/errorHandler';

/**
 * Middleware to validate request data
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    next(createError(errorMessages.join(', '), 400));
    return;
  }

  next();
};

