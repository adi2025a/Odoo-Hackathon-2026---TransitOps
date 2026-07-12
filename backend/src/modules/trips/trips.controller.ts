import { Request, Response, NextFunction } from 'express';
import Trip from '../../models/Trip';
import Vehicle from '../../models/Vehicle';
import Driver from '../../models/Driver';
import FuelLog from '../../models/FuelLog';
import Expense from '../../models/Expense';
import Notification from '../../models/Notification';
import User from '../../models/User';
import { sendSuccess, sendError } from '../../utils/response';
import { getPaginationData } from '../../utils/pagination';

// Helper to check driverId constraint
const getDriverIdForUser = async (userId: string): Promise<string | null> => {
  const user = await User.findById(userId);
  return user?.driverId || null;
};

export const listTrips = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, priority, vehicleId, driverId, page = 1, limit = 20 } = req.query;

    const filter: any = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (driverId) filter.driverId = driverId;

    // RBAC: Drivers can only view their own trip assignments
    if (req.user?.role === 'Driver') {
      const userDriverId = await getDriverIdForUser(req.user.userId);
      if (!userDriverId) {
        sendSuccess(res, [], 'No trips assigned', 200, { page: 1, limit: Number(limit), total: 0, totalPages: 0 });
        return;
      }
      filter.driverId = userDriverId;
    }

    const result = await getPaginationData<any>(Trip, filter, {
      page: Number(page),
      limit: Number(limit),
    });

    sendSuccess(res, result.data, 'Trips retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);

    if (!trip) {
      sendError(res, 'TRIP_NOT_FOUND', 'Trip not found', 404);
      return;
    }

    // RBAC: Driver can only view their own trips
    if (req.user?.role === 'Driver') {
      const userDriverId = await getDriverIdForUser(req.user.userId);
      if (trip.driverId !== userDriverId) {
        sendError(res, 'FORBIDDEN', 'Access denied. You can only view your own trip details.', 403);
        return;
      }
    }

    sendSuccess(res, trip, 'Trip retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, vehicleId, driverId, ...body } = req.body;

    // 1. Check duplicate trip
    const existing = await Trip.findById(id);
    if (existing) {
      sendError(res, 'TRIP_EXISTS', `Trip with ID ${id} already exists`, 400);
      return;
    }

    // 2. Validate vehicle availability
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      sendError(res, 'VEHICLE_NOT_FOUND', 'Vehicle not found', 404);
      return;
    }
    if (vehicle.status !== 'Available') {
      sendError(res, 'VEHICLE_NOT_AVAILABLE', 'The selected vehicle is currently not available', 409);
      return;
    }

    // 3. Validate driver availability
    const driver = await Driver.findById(driverId);
    if (!driver) {
      sendError(res, 'DRIVER_NOT_FOUND', 'Driver not found', 404);
      return;
    }
    if (driver.status !== 'Available') {
      sendError(res, 'DRIVER_NOT_AVAILABLE', 'The selected driver is currently not available', 409);
      return;
    }

    const nowStr = new Date().toISOString();

    // 4. Create Trip
    const trip = await Trip.create({
      _id: id,
      vehicleId,
      driverId,
      status: 'Dispatched',
      ...body,
      timeline: [
        {
          time: nowStr,
          title: 'Trip Dispatched',
          description: `Trip dispatched to ${driver.name} using vehicle ${vehicle.name} (${vehicle.regNumber})`,
        },
      ],
    });

    // 5. Update vehicle & driver status
    vehicle.status = 'On Trip';
    vehicle.assignedDriverId = driverId;
    await vehicle.save();

    driver.status = 'On Trip';
    driver.currentVehicleId = vehicleId;
    await driver.save();

    // 6. Create driver notification
    await Notification.create({
      _id: `NTF-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: driverId,
      type: 'Trip Assigned',
      title: 'New Trip Dispatched',
      message: `New route assigned: ${trip.source} → ${trip.destination}. Cargo: ${trip.cargoType}.`,
      date: nowStr,
      read: false,
      severity: 'info',
    });

    sendSuccess(res, trip, 'Trip dispatched and statuses updated successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    if (!trip) {
      sendError(res, 'TRIP_NOT_FOUND', 'Trip not found', 404);
      return;
    }

    Object.assign(trip, req.body);
    await trip.save();

    sendSuccess(res, trip, 'Trip updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTripStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const trip = await Trip.findById(id);
    if (!trip) {
      sendError(res, 'TRIP_NOT_FOUND', 'Trip not found', 404);
      return;
    }

    // RBAC: Drivers can only edit status of their own trip
    if (req.user?.role === 'Driver') {
      const userDriverId = await getDriverIdForUser(req.user.userId);
      if (trip.driverId !== userDriverId) {
        sendError(res, 'FORBIDDEN', 'Access denied. You can only update status of your own trip.', 403);
        return;
      }
      // Drivers cannot cancel trips
      if (status === 'Cancelled') {
        sendError(res, 'FORBIDDEN', 'Access denied. Drivers cannot cancel trips.', 403);
        return;
      }
    }

    const nowStr = new Date().toISOString();

    // If cancelling, handle reversal
    if (status === 'Cancelled') {
      // Revert statuses to Available
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'Available' });
      await Driver.findByIdAndUpdate(trip.driverId, { status: 'Available' });
    }

    trip.status = status;
    if (remarks) trip.remarks = remarks;

    trip.timeline.push({
      time: nowStr,
      title: `Status Changed: ${status}`,
      description: remarks || `Trip status updated to ${status}`,
    });

    await trip.save();

    sendSuccess(res, trip, `Trip status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

export const completeTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { finalOdometer, fuelUsed, expenses, deliveryProof, remarks } = req.body;

    const trip = await Trip.findById(id);
    if (!trip) {
      sendError(res, 'TRIP_NOT_FOUND', 'Trip not found', 404);
      return;
    }

    // RBAC: Drivers can only complete their own trip
    if (req.user?.role === 'Driver') {
      const userDriverId = await getDriverIdForUser(req.user.userId);
      if (trip.driverId !== userDriverId) {
        sendError(res, 'FORBIDDEN', 'Access denied. You can only complete your own trip.', 403);
        return;
      }
    }

    const nowStr = new Date().toISOString();

    // 1. Save completion data on trip
    trip.status = 'Completed';
    trip.completionData = {
      finalOdometer,
      fuelUsed,
      expenses,
      deliveryProof,
      remarks,
      completedAt: nowStr,
    };
    trip.timeline.push({
      time: nowStr,
      title: 'Delivered',
      description: remarks || 'Cargo delivered and completion details submitted.',
    });
    await trip.save();

    // 2. Set vehicle status to Available, update odometer
    const vehicle = await Vehicle.findById(trip.vehicleId);
    if (vehicle) {
      vehicle.status = 'Available';
      vehicle.odometer = finalOdometer;
      await vehicle.save();
    }

    // 3. Set driver status to Available
    const driver = await Driver.findById(trip.driverId);
    if (driver) {
      driver.status = 'Available';
      await driver.save();
    }

    // 4. Create FuelLog record
    const fuelCost = fuelUsed * 1.15; // Assume average fuel rate $1.15/liter
    const fuelLogId = `FUL-${Math.floor(100000 + Math.random() * 900000)}`;
    await FuelLog.create({
      _id: fuelLogId,
      vehicleId: trip.vehicleId,
      tripId: trip._id,
      driverId: trip.driverId,
      fuelQuantity: fuelUsed,
      fuelCost,
      station: 'TransitOps Main Depot Station',
      date: nowStr,
      odometer: finalOdometer,
    });

    // 5. Create Expense record for Fuel
    await Expense.create({
      _id: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      vehicleId: trip.vehicleId,
      category: 'Fuel',
      amount: fuelCost,
      date: nowStr,
      description: `Automatic fuel expense for Trip ID: ${trip._id}`,
      status: 'Approved',
    });

    // 6. If extra expenses, log them as Toll/Miscellaneous
    if (expenses > 0) {
      await Expense.create({
        _id: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
        vehicleId: trip.vehicleId,
        category: 'Toll',
        amount: expenses,
        date: nowStr,
        description: `Additional incidentals logged by driver for Trip ID: ${trip._id}`,
        status: 'Approved',
      });
    }

    // 7. Create notification for fleet managers
    await Notification.create({
      _id: `NTF-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: null, // broadcast to admins/managers
      type: 'Trip Completed',
      title: 'Trip Completed',
      message: `Trip ${trip._id} (${trip.source} → ${trip.destination}) has been successfully completed.`,
      date: nowStr,
      read: false,
      severity: 'info',
    });

    // Check fuel efficiency anomaly (auto-trigger inline)
    const distance = trip.distance || 1;
    const efficiency = fuelUsed / distance;
    // Simple average fuel check: if it is high, flag it
    if (efficiency > 0.45) { // Threshold for anomaly alert
      await Notification.create({
        _id: `NTF-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: null,
        type: 'High Fuel Usage',
        title: 'High Fuel Usage Alert',
        message: `Trip ${trip._id} flagged for high fuel usage: ${(efficiency * 100).toFixed(1)} L/100km.`,
        date: nowStr,
        read: false,
        severity: 'warning',
      });
    }

    sendSuccess(res, trip, 'Trip completed successfully, fuel log and expenses auto-generated.');
  } catch (error) {
    next(error);
  }
};

export const getActiveTrips = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trips = await Trip.find({ status: 'On Trip' });
    sendSuccess(res, trips, 'Active trips retrieved');
  } catch (error) {
    next(error);
  }
};

export const getTripsByDriverId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { driverId } = req.params;
    const trips = await Trip.find({ driverId }).sort({ createdAt: -1 });
    sendSuccess(res, trips, 'Driver trips retrieved');
  } catch (error) {
    next(error);
  }
};
