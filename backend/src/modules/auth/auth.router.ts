import { Router } from 'express';
import { register, login, logout, refresh, forgotPassword, resetPassword, me } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { authLimiter } from '../../middleware/rateLimiter';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema';

export const authRouter = Router();

authRouter.post('/register', authenticate, authorize('Super Admin'), validate(registerSchema), register);
authRouter.post('/login', authLimiter, validate(loginSchema), login);
authRouter.post('/logout', authenticate, logout);
authRouter.post('/refresh', refresh);
authRouter.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
authRouter.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);
authRouter.get('/me', authenticate, me);

export default authRouter;
