import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';

export const auditLogger = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Let the response finish
  res.on('finish', async () => {
    try {
      const isWriteMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
      const isSuccessful = res.statusCode >= 200 && res.statusCode < 300;

      if (isWriteMethod && isSuccessful && req.user) {
        // Extract resource from path (e.g., /api/vehicles/:id -> vehicles)
        const pathParts = req.originalUrl.split('?')[0].split('/');
        const apiIndex = pathParts.indexOf('api');
        const resource = apiIndex !== -1 && pathParts[apiIndex + 1] ? pathParts[apiIndex + 1] : 'unknown';
        
        // Safely extract resourceId as string | undefined (params.id is always string)
        const rawResourceId = req.params.id ?? pathParts[apiIndex + 2];
        const resourceId: string | undefined = typeof rawResourceId === 'string' ? rawResourceId : undefined;

        // Build ip as a plain string
        const ipAddress: string = req.ip ?? String(req.socket?.remoteAddress ?? '');

        await AuditLog.create({
          userId: req.user.userId,
          action: req.method,
          resource,
          resourceId,
          ipAddress,
          timestamp: new Date(),
        });
      }
    } catch (err) {
      console.error('⚠️ Failed to write audit log:', err);
    }
  });

  next();
};
