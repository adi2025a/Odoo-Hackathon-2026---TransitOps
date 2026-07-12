import { Router } from 'express';
import {
  listNotifications,
  markAsRead,
  markAllRead,
  createNotification,
  deleteNotification
} from './notifications.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createNotificationSchema } from './notifications.schema';

export const notificationsRouter = Router();

notificationsRouter.get('/', authenticate, listNotifications);
notificationsRouter.patch('/read-all', authenticate, markAllRead);
notificationsRouter.patch('/:id/read', authenticate, markAsRead);
notificationsRouter.post('/', authenticate, authorize('Super Admin'), validate(createNotificationSchema), createNotification);
notificationsRouter.delete('/:id', authenticate, authorize('Super Admin'), deleteNotification);

export default notificationsRouter;
