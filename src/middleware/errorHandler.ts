import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Log error details for debugging
  console.error('Error occurred:', {
    statusCode,
    message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Firebase specific errors
  if (error.message.includes('auth/email-already-exists')) {
    statusCode = 400;
    message = 'User with this email already exists';
  } else if (error.message.includes('auth/invalid-email')) {
    statusCode = 400;
    message = 'Invalid email address';
  } else if (error.message.includes('auth/weak-password')) {
    statusCode = 400;
    message = 'Password is too weak';
  } else if (error.message.includes('auth/user-not-found')) {
    statusCode = 404;
    message = 'User not found';
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
