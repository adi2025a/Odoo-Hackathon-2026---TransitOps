import { Request, Response, NextFunction } from 'express';
import Vehicle from '../../models/Vehicle';
import Trip from '../../models/Trip';
import MaintenanceRecord from '../../models/MaintenanceRecord';
import FuelLog from '../../models/FuelLog';
import Expense from '../../models/Expense';
import { sendSuccess, sendError } from '../../utils/response';
import { getPaginationData } from '../../utils/pagination';

export const listVehicles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, region, type, search, page = 1, limit = 20 } = req.query;

    const filter: any = {};

    if (status) filter.status = status;
    if (region) filter.region = region;
    if (type) filter.type = type;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { regNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { vin: { $regex: search, $options: 'i' } },
      ];
    }

    const result = await getPaginationData<any>(Vehicle, filter, {
      page: Number(page),
      limit: Number(limit),
    });

    sendSuccess(res, result.data, 'Vehicles retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      sendError(res, 'VEHICLE_NOT_FOUND', 'Vehicle not found', 404);
      return;
    }

    sendSuccess(res, vehicle, 'Vehicle retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, ...body } = req.body;

    const existing = await Vehicle.findById(id);
    if (existing) {
      sendError(res, 'VEHICLE_EXISTS', `Vehicle with ID ${id} already exists`, 400);
      return;
    }

    const existingReg = await Vehicle.findOne({ regNumber: body.regNumber });
    if (existingReg) {
      sendError(res, 'REG_NUMBER_EXISTS', 'Registration number already exists', 400);
      return;
    }

    const vehicle = await Vehicle.create({
      _id: id,
      ...body,
    });

    sendSuccess(res, vehicle, 'Vehicle created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByIdAndUpdate(id, req.body, { new: true });

    if (!vehicle) {
      sendError(res, 'VEHICLE_NOT_FOUND', 'Vehicle not found', 404);
      return;
    }

    sendSuccess(res, vehicle, 'Vehicle updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Soft delete: set status to 'Retired'
    const vehicle = await Vehicle.findByIdAndUpdate(id, { status: 'Retired' }, { new: true });

    if (!vehicle) {
      sendError(res, 'VEHICLE_NOT_FOUND', 'Vehicle not found', 404);
      return;
    }

    sendSuccess(res, vehicle, 'Vehicle soft-deleted (retired) successfully');
  } catch (error) {
    next(error);
  }
};

export const updateVehicleStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const vehicle = await Vehicle.findByIdAndUpdate(id, { status }, { new: true });

    if (!vehicle) {
      sendError(res, 'VEHICLE_NOT_FOUND', 'Vehicle not found', 404);
      return;
    }

    sendSuccess(res, vehicle, 'Vehicle status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getVehicleTrips = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const trips = await Trip.find({ vehicleId: id }).sort({ createdAt: -1 });
    sendSuccess(res, trips, 'Vehicle trips retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getVehicleMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const records = await MaintenanceRecord.find({ vehicleId: id }).sort({ createdAt: -1 });
    sendSuccess(res, records, 'Vehicle maintenance records retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getVehicleFuel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const logs = await FuelLog.find({ vehicleId: id }).sort({ date: -1 });
    sendSuccess(res, logs, 'Vehicle fuel logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getVehicleExpenses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const expenses = await Expense.find({ vehicleId: id }).sort({ date: -1 });
    sendSuccess(res, expenses, 'Vehicle expenses retrieved successfully');
  } catch (error) {
    next(error);
  }
};
