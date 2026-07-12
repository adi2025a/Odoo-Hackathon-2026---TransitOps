import { Request, Response, NextFunction } from 'express';
import FuelLog from '../../models/FuelLog';
import Expense from '../../models/Expense';
import Vehicle from '../../models/Vehicle';
import User from '../../models/User';
import { sendSuccess, sendError } from '../../utils/response';
import { getPaginationData } from '../../utils/pagination';

export const listFuelLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { vehicleId, driverId, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (vehicleId) filter.vehicleId = vehicleId;
    if (driverId) filter.driverId = driverId;

    const result = await getPaginationData<any>(FuelLog, filter, {
      page: Number(page),
      limit: Number(limit),
    });

    sendSuccess(res, result.data, 'Fuel logs retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getFuelLogById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const log = await FuelLog.findById(id);

    if (!log) {
      sendError(res, 'FUEL_LOG_NOT_FOUND', 'Fuel log not found', 404);
      return;
    }

    sendSuccess(res, log, 'Fuel log retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createFuelLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, vehicleId, driverId, fuelQuantity, fuelCost, station, date, odometer, tripId } = req.body;

    // Duplication check
    const existing = await FuelLog.findById(id);
    if (existing) {
      sendError(res, 'FUEL_LOG_EXISTS', `Fuel log with ID ${id} already exists`, 400);
      return;
    }

    // Drivers constraint: A Driver can only log fuel for their own vehicle/trip
    if (req.user?.role === 'Driver') {
      const user = await User.findById(req.user.userId);
      if (user?.driverId !== driverId) {
        sendError(res, 'FORBIDDEN', 'Access denied. Drivers can only create fuel logs for their own profile.', 403);
        return;
      }
    }

    const log = await FuelLog.create({
      _id: id,
      vehicleId,
      tripId: tripId || null,
      driverId,
      fuelQuantity,
      fuelCost,
      station,
      date,
      odometer,
    });

    // Auto update vehicle odometer
    await Vehicle.findByIdAndUpdate(vehicleId, { odometer });

    // Auto-create Expense
    await Expense.create({
      _id: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      vehicleId,
      category: 'Fuel',
      amount: fuelCost,
      date,
      description: `Fuel purchase at ${station} - ${fuelQuantity}L`,
      status: 'Approved',
    });

    sendSuccess(res, log, 'Fuel log and expense created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getFuelLogsByVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const logs = await FuelLog.find({ vehicleId: id }).sort({ date: -1 });
    sendSuccess(res, logs, 'Vehicle fuel logs retrieved');
  } catch (error) {
    next(error);
  }
};

export const getFuelStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await FuelLog.aggregate([
      {
        $group: {
          _id: null,
          totalFuel: { $sum: '$fuelQuantity' },
          totalCost: { $sum: '$fuelCost' },
          avgCostPerLiter: { $avg: { $divide: ['$fuelCost', '$fuelQuantity'] } },
        },
      },
    ]);

    const result = stats[0] || { totalFuel: 0, totalCost: 0, avgCostPerLiter: 0 };
    sendSuccess(res, result, 'Fuel statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};
