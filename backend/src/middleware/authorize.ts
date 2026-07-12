import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        'FORBIDDEN',
        `Access denied. Required roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        403
      );
      return;
    }

    next();
  };
};
