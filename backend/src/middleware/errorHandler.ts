import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('🔥 Error caught by global handler:', err);

  if (err.name === 'ValidationError') {
    return sendError(res, 'VALIDATION_ERROR', err.message, 400);
  }

  if (err.name === 'UnauthorizedError' || err.message === 'jwt expired') {
    return sendError(res, 'UNAUTHORIZED', 'Session expired or invalid token', 401);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'UNAUTHORIZED', 'Invalid credentials or token signature', 401);
  }

  // Handle express-rate-limit error message if custom
  if (err.statusCode === 429) {
    return sendError(res, 'RATE_LIMIT_EXCEEDED', err.message || 'Too many requests, please try again later.', 429);
  }

  // Fallback to internal server error
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return sendError(res, code, message, statusCode, err.details || undefined);
};
