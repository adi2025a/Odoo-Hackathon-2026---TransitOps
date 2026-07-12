import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '../../models/User';
import { hashPassword, comparePasswords } from '../../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { sendSuccess, sendError } from '../../utils/response';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, avatar, driverId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 'USER_EXISTS', 'User with this email already exists', 400);
      return;
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      driverId,
      isActive: true,
    });

    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      driverId: newUser.driverId,
    };

    sendSuccess(res, userResponse, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      sendError(res, 'INVALID_CREDENTIALS', 'Invalid email, password, or inactive account', 401);
      return;
    }

    if (!user.password) {
      sendError(res, 'INVALID_CREDENTIALS', 'Invalid credentials', 401);
      return;
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      sendError(res, 'INVALID_CREDENTIALS', 'Invalid email, password, or inactive account', 401);
      return;
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload, rememberMe);

    // Save refresh token hashed in db for security
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.refreshToken = hashedRefreshToken;
    user.rememberMe = rememberMe;
    await user.save();

    // Set HTTPOnly cookie for refresh token
    const cookieExpiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieExpiry,
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      driverId: user.driverId,
    };

    sendSuccess(res, { accessToken, user: userResponse }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      const user = await User.findById(req.user.userId);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      sendError(res, 'REFRESH_TOKEN_REQUIRED', 'Refresh token required', 401);
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      sendError(res, 'UNAUTHORIZED', 'User account not active', 401);
      return;
    }

    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    if (user.refreshToken !== hashedToken) {
      sendError(res, 'UNAUTHORIZED', 'Invalid session or refresh token reuse detected', 401);
      return;
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(payload);
    sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200/success anyway to prevent user enumeration
      sendSuccess(res, null, 'If that email exists in our system, we have sent a reset code.');
      return;
    }

    // Generate 6 digit code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');

    user.resetToken = hashedOtp;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    await user.save();

    // In a real application, email the code.
    // For local testing and sandbox simplicity, log the code to stdout and return success
    console.log(`🔑 PASSWORD RESET OTP FOR ${email}: ${otpCode}`);

    sendSuccess(res, null, 'Verification code generated and sent.');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      sendError(res, 'INVALID_RESET_REQUEST', 'Invalid or expired code reset session', 400);
      return;
    }

    if (user.resetTokenExpiry.getTime() < Date.now()) {
      sendError(res, 'CODE_EXPIRED', 'Verification code has expired', 400);
      return;
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    if (user.resetToken !== hashedCode) {
      sendError(res, 'INVALID_CODE', 'The verification code is incorrect', 400);
      return;
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.refreshToken = undefined; // Force re-login on all devices
    await user.save();

    sendSuccess(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Session invalid', 401);
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user || !user.isActive) {
      sendError(res, 'USER_NOT_FOUND', 'User not found or inactive', 404);
      return;
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      driverId: user.driverId,
    };

    sendSuccess(res, userResponse, 'Current user profile retrieved');
  } catch (error) {
    next(error);
  }
};
