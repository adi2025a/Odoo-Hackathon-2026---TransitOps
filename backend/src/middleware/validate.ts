import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.slice(1).join('.'); // Remove 'body'/'query' prefix
          fieldErrors[path || String(issue.path[0])] = issue.message;
        });

        sendError(res, 'VALIDATION_ERROR', 'Request parameters validation failed', 400, fieldErrors);
        return;
      }
      next(error);
    }
  };
};
