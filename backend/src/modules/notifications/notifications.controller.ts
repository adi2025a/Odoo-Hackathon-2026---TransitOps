import { Request, Response, NextFunction } from 'express';
import Notification from '../../models/Notification';
import User from '../../models/User';
import { sendSuccess, sendError } from '../../utils/response';

export const listNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: any = {};

    // RBAC check: Drivers see only their assignments + broadcast notifications
    if (req.user?.role === 'Driver') {
      const user = await User.findById(req.user.userId);
      const driverId = user?.driverId || 'non-existent';
      filter.$or = [
        { userId: driverId },
        { userId: null },
      ];
    }

    const notifications = await Notification.find(filter).sort({ date: -1 }).limit(50);
    sendSuccess(res, notifications, 'Notifications retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

    if (!notification) {
      sendError(res, 'NOTIFICATION_NOT_FOUND', 'Notification not found', 404);
      return;
    }

    sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: any = {};

    // If Driver, only update theirs
    if (req.user?.role === 'Driver') {
      const user = await User.findById(req.user.userId);
      const driverId = user?.driverId || 'non-existent';
      filter.$or = [
        { userId: driverId },
        { userId: null },
      ];
    }

    await Notification.updateMany(filter, { read: true });
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, ...body } = req.body;

    const existing = await Notification.findById(id);
    if (existing) {
      sendError(res, 'NOTIFICATION_EXISTS', `Notification with ID ${id} already exists`, 400);
      return;
    }

    const notification = await Notification.create({
      _id: id,
      ...body,
    });

    sendSuccess(res, notification, 'Notification dispatched successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      sendError(res, 'NOTIFICATION_NOT_FOUND', 'Notification not found', 404);
      return;
    }

    sendSuccess(res, null, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};
