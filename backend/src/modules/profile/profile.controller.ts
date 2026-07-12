import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import { hashPassword, comparePasswords } from '../../utils/bcrypt';
import { sendSuccess, sendError } from '../../utils/response';

export const getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Session expired', 401);
      return;
    }

    const user = await User.findById(req.user.userId, { password: 0, refreshToken: 0 });
    if (!user) {
      sendError(res, 'USER_NOT_FOUND', 'User profile not found', 404);
      return;
    }

    sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Session expired', 401);
      return;
    }

    const { name, avatar } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true });
    if (!user) {
      sendError(res, 'USER_NOT_FOUND', 'User profile not found', 404);
      return;
    }

    const { password: _pw, ...result } = user.toObject();
    sendSuccess(res, result, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const changeMyPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Session expired', 401);
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      sendError(res, 'FIELDS_REQUIRED', 'Current password and new password are required', 400);
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user || !user.password) {
      sendError(res, 'USER_NOT_FOUND', 'User profile not found', 404);
      return;
    }

    const isMatch = await comparePasswords(currentPassword, user.password);
    if (!isMatch) {
      sendError(res, 'INVALID_PASSWORD', 'Current password does not match', 400);
      return;
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.refreshToken = undefined; // Invalidate current tokens
    await user.save();

    sendSuccess(res, null, 'Password updated successfully. Please log in again.');
  } catch (error) {
    next(error);
  }
};
