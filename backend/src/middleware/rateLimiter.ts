import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response';

export const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  // Disable all built-in validations (suppresses IPv6 key generator warning)
  validate: false,
  handler: (req, res) => {
    sendError(res, 'RATE_LIMIT_EXCEEDED', 'Too many requests. Please try again after a minute.', 429);
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    // For authenticated requests, key by userId; fall back to IP
    const user = (req as any).user;
    if (user?.userId) return user.userId;
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    return ip.replace(/^::ffff:/, '');
  },
  handler: (req, res) => {
    sendError(res, 'RATE_LIMIT_EXCEEDED', 'Request rate limit exceeded. Slow down.', 429);
  },
});
