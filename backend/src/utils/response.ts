import { Response } from 'express';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200,
  pagination?: PaginationInfo
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  });
};

export const sendError = (
  res: Response,
  errorCode: string,
  message: string,
  statusCode: number = 400,
  details?: any
) => {
  return res.status(statusCode).json({
    success: false,
    error: errorCode,
    message,
    ...(details && { details }),
  });
};
