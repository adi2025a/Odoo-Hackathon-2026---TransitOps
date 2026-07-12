import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import { hashPassword } from '../../utils/bcrypt';
import { sendSuccess, sendError } from '../../utils/response';

// In-memory dummy system settings since it's customizable
let systemSettings = {
  appName: 'TransitOps Fleet Management',
  alertEmail: 'alerts@transitops.com',
  maintenanceOdometerInterval: 10000, // km
  currency: 'USD',
  timezone: 'UTC',
};

export const getSystemSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, systemSettings, 'System settings retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateSystemSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    systemSettings = { ...systemSettings, ...req.body };
    sendSuccess(res, systemSettings, 'System settings updated successfully');
  } catch (error) {
    next(error);
  }
};

export const listAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find({}, { password: 0, refreshToken: 0, resetToken: 0, resetTokenExpiry: 0 });
    sendSuccess(res, users, 'All system users retrieved');
  } catch (error) {
    next(error);
  }
};

export const createUserAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, avatar, driverId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      sendError(res, 'USER_EXISTS', 'User with this email already exists', 400);
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      driverId,
      isActive: true,
    });

    const { password: _pw, refreshToken: _rt, ...result } = user.toObject();
    sendSuccess(res, result, 'User account created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateUserAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, avatar, driverId, isActive } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (avatar !== undefined) updates.avatar = avatar;
    if (driverId !== undefined) updates.driverId = driverId;
    if (isActive !== undefined) updates.isActive = isActive;

    if (req.body.password) {
      updates.password = await hashPassword(req.body.password);
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
      return;
    }

    const { password: _pw2, refreshToken: _rt2, ...result } = user.toObject();
    sendSuccess(res, result, 'User account updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deactivateUserAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!user) {
      sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
      return;
    }

    sendSuccess(res, null, 'User account deactivated successfully');
  } catch (error) {
    next(error);
  }
};
