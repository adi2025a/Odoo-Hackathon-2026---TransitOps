import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/express';

export const generateAccessToken = (payload: JwtPayload): string => {
  return (jwt.sign as Function)(payload, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = (payload: JwtPayload, rememberMe: boolean): string => {
  const expiry = rememberMe ? '30d' : env.REFRESH_TOKEN_EXPIRY;
  return (jwt.sign as Function)(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: expiry,
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};
