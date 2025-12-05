import { Request, Response, NextFunction } from 'express';

/**
 * Custom error interface
 * @interface AppError
 * @extends {Error}
 * @property {number} [statusCode] - HTTP status code
 * @property {number} [status] - Alternative HTTP status code property
 * @property {boolean} [isOperational] - Whether the error is operational (expected)
 */
export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  isOperational?: boolean;
}

/**
 * Global error handler middleware
 * Handles all errors and sends standardized error responses
 * @param {AppError} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

/**
 * Create custom error object with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {AppError} Custom error object with statusCode and isOperational flag
 */
export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

