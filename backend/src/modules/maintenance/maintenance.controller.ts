import { Request, Response, NextFunction } from 'express';
import MaintenanceRecord from '../../models/MaintenanceRecord';
import Vehicle from '../../models/Vehicle';
import Expense from '../../models/Expense';
import { sendSuccess, sendError } from '../../utils/response';
import { getPaginationData } from '../../utils/pagination';

export const listMaintenanceRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, type, vehicleId, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (vehicleId) filter.vehicleId = vehicleId;

    const result = await getPaginationData<any>(MaintenanceRecord, filter, {
      page: Number(page),
      limit: Number(limit),
    });

    sendSuccess(res, result.data, 'Maintenance records retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceRecordById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const record = await MaintenanceRecord.findById(id);

    if (!record) {
      sendError(res, 'MAINTENANCE_RECORD_NOT_FOUND', 'Maintenance record not found', 404);
      return;
    }

    sendSuccess(res, record, 'Maintenance record retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createMaintenanceRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, vehicleId, cost, status, ...body } = req.body;

    const existing = await MaintenanceRecord.findById(id);
    if (existing) {
      sendError(res, 'MAINTENANCE_RECORD_EXISTS', `Record with ID ${id} already exists`, 400);
      return;
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      sendError(res, 'VEHICLE_NOT_FOUND', 'Vehicle not found', 404);
      return;
    }

    const record = await MaintenanceRecord.create({
      _id: id,
      vehicleId,
      cost,
      status,
      ...body,
    });

    const nowStr = new Date().toISOString();

    // Business Logic: If status is ACTIVE, set vehicle to Maintenance immediately
    if (status === 'Active') {
      vehicle.status = 'Maintenance';
      await vehicle.save();

      // Create Expense record auto-approved
      await Expense.create({
        _id: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
        vehicleId,
        category: 'Maintenance',
        amount: cost,
        date: nowStr,
        description: `Automated maintenance expense for Record: ${id} (${body.type})`,
        status: 'Approved',
      });
    }

    sendSuccess(res, record, 'Maintenance record created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateMaintenanceRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const record = await MaintenanceRecord.findById(id);

    if (!record) {
      sendError(res, 'MAINTENANCE_RECORD_NOT_FOUND', 'Maintenance record not found', 404);
      return;
    }

    const prevStatus = record.status;
    Object.assign(record, req.body);
    await record.save();

    // If transitioned from Scheduled to Active, apply logic
    if (prevStatus === 'Scheduled' && record.status === 'Active') {
      const vehicle = await Vehicle.findById(record.vehicleId);
      if (vehicle) {
        vehicle.status = 'Maintenance';
        await vehicle.save();
      }

      await Expense.create({
        _id: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
        vehicleId: record.vehicleId,
        category: 'Maintenance',
        amount: record.cost,
        date: new Date().toISOString(),
        description: `Automated maintenance expense for Record: ${record._id} (${record.type})`,
        status: 'Approved',
      });
    }

    sendSuccess(res, record, 'Maintenance record updated successfully');
  } catch (error) {
    next(error);
  }
};

export const completeMaintenanceRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const record = await MaintenanceRecord.findById(id);

    if (!record) {
      sendError(res, 'MAINTENANCE_RECORD_NOT_FOUND', 'Maintenance record not found', 404);
      return;
    }

    const nowStr = new Date().toISOString();

    record.status = 'Completed';
    record.endDate = nowStr;
    await record.save();

    // Revert vehicle to Available
    const vehicle = await Vehicle.findById(record.vehicleId);
    if (vehicle) {
      vehicle.status = 'Available';
      await vehicle.save();
    }

    sendSuccess(res, record, 'Maintenance completed, vehicle status restored to Available.');
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceByVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const records = await MaintenanceRecord.find({ vehicleId: id }).sort({ startDate: -1 });
    sendSuccess(res, records, 'Vehicle maintenance logs retrieved');
  } catch (error) {
    next(error);
  }
};

export const getUpcomingMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const records = await MaintenanceRecord.find({
      status: 'Scheduled',
    }).sort({ startDate: 1 });

    sendSuccess(res, records, 'Upcoming maintenance records retrieved');
  } catch (error) {
    next(error);
  }
};
