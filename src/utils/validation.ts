import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { createError } from '../middlewares/errorHandler';

/**
 * Middleware to validate request data using express-validator
 * Checks validation results and passes errors to error handler if validation fails
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export const validateRequest = (
  req: Request,
  _res: Response,
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

