import { Request, Response, NextFunction } from 'express';
import Driver from '../../models/Driver';
import Trip from '../../models/Trip';
import { sendSuccess, sendError } from '../../utils/response';
import { getPaginationData } from '../../utils/pagination';

export const listDrivers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, licenseCategory, search, page = 1, limit = 20 } = req.query;

    const filter: any = {};

    if (status) filter.status = status;
    if (licenseCategory) filter.licenseCategory = licenseCategory;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const result = await getPaginationData<any>(Driver, filter, {
      page: Number(page),
      limit: Number(limit),
    });

    sendSuccess(res, result.data, 'Drivers retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getDriverById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Direct driver constraint: Drivers can only view their own driver profile (unless they are admin/manager/etc.)
    if (req.user?.role === 'Driver' && req.user.email !== id && req.params.id !== 'me') {
      // Find driver by user email first to map
      const matchedDriver = await Driver.findOne({ email: req.user.email });
      if (!matchedDriver || matchedDriver._id !== id) {
        sendError(res, 'FORBIDDEN', 'Access denied. Drivers can only view their own profile.', 403);
        return;
      }
    }

    const driver = await Driver.findById(id);
    if (!driver) {
      sendError(res, 'DRIVER_NOT_FOUND', 'Driver not found', 404);
      return;
    }

    sendSuccess(res, driver, 'Driver retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createDriver = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, ...body } = req.body;

    const existing = await Driver.findById(id);
    if (existing) {
      sendError(res, 'DRIVER_EXISTS', `Driver with ID ${id} already exists`, 400);
      return;
    }

    const existingEmail = await Driver.findOne({ email: body.email });
    if (existingEmail) {
      sendError(res, 'EMAIL_EXISTS', 'Driver with this email already exists', 400);
      return;
    }

    const driver = await Driver.create({
      _id: id,
      ...body,
    });

    sendSuccess(res, driver, 'Driver created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateDriver = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const driver = await Driver.findByIdAndUpdate(id, req.body, { new: true });

    if (!driver) {
      sendError(res, 'DRIVER_NOT_FOUND', 'Driver not found', 404);
      return;
    }

    sendSuccess(res, driver, 'Driver updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteDriver = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Soft delete: set status to 'Suspended'
    const driver = await Driver.findByIdAndUpdate(id, { status: 'Suspended' }, { new: true });

    if (!driver) {
      sendError(res, 'DRIVER_NOT_FOUND', 'Driver not found', 404);
      return;
    }

    sendSuccess(res, driver, 'Driver soft-deleted (suspended) successfully');
  } catch (error) {
    next(error);
  }
};

export const updateDriverStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const driver = await Driver.findByIdAndUpdate(id, { status }, { new: true });

    if (!driver) {
      sendError(res, 'DRIVER_NOT_FOUND', 'Driver not found', 404);
      return;
    }

    sendSuccess(res, driver, 'Driver status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getDriverTrips = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const trips = await Trip.find({ driverId: id }).sort({ createdAt: -1 });
    sendSuccess(res, trips, 'Driver trips retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getDriverSafetyHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const driver = await Driver.findById(id);

    if (!driver) {
      sendError(res, 'DRIVER_NOT_FOUND', 'Driver not found', 404);
      return;
    }

    // Return dummy safety score progression chart data
    const safetyHistory = [
      { month: 'Jan', score: Math.min(100, driver.safetyScore - 4) },
      { month: 'Feb', score: Math.min(100, driver.safetyScore - 2) },
      { month: 'Mar', score: Math.min(100, driver.safetyScore + 1) },
      { month: 'Apr', score: Math.min(100, driver.safetyScore - 1) },
      { month: 'May', score: driver.safetyScore },
    ];

    sendSuccess(res, { currentScore: driver.safetyScore, history: safetyHistory }, 'Safety score history retrieved');
  } catch (error) {
    next(error);
  }
};
