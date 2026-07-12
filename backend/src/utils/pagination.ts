import { Query } from 'mongoose';
import { PaginationInfo } from './response';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export const getPaginationData = async <T>(
  queryModel: any,
  filter: any,
  options: PaginationOptions
): Promise<{ data: T[]; pagination: PaginationInfo }> => {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.max(1, Number(options.limit || 20));
  const skip = (page - 1) * limit;

  const total = await queryModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const data = await queryModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  return {
    data: data as T[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
