import { Request, Response, NextFunction } from 'express';
import Trip from '../../models/Trip';
import Vehicle from '../../models/Vehicle';
import Driver from '../../models/Driver';
import FuelLog from '../../models/FuelLog';
import Expense from '../../models/Expense';
import MaintenanceRecord from '../../models/MaintenanceRecord';
import { sendSuccess } from '../../utils/response';

export const getTripSummaryReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const summary = await Trip.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          avgDistance: { $avg: '$distance' },
        },
      },
    ]);

    const formatted = {
      completed: summary.find(s => s._id === 'Completed')?.count || 0,
      cancelled: summary.find(s => s._id === 'Cancelled')?.count || 0,
      onTrip: summary.find(s => s._id === 'On Trip')?.count || 0,
      pending: summary.find(s => s._id === 'Pending')?.count || 0,
      draft: summary.find(s => s._id === 'Draft')?.count || 0,
      dispatched: summary.find(s => s._id === 'Dispatched')?.count || 0,
      totalTrips: summary.reduce((sum, s) => sum + s.count, 0),
      avgDistance: summary.reduce((sum, s) => sum + (s.totalDistance || 0), 0) / (summary.reduce((sum, s) => sum + s.count, 0) || 1),
    };

    sendSuccess(res, formatted, 'Trip summary report generated');
  } catch (error) {
    next(error);
  }
};

export const getFleetUtilizationReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalVehiclesCount = await Vehicle.countDocuments();
    const onTripCount = await Vehicle.countDocuments({ status: 'On Trip' });
    const maintenanceCount = await Vehicle.countDocuments({ status: 'Maintenance' });
    const availableCount = await Vehicle.countDocuments({ status: 'Available' });

    const utilizationByRegion = await Vehicle.aggregate([
      {
        $group: {
          _id: '$region',
          total: { $sum: 1 },
          onTrip: { $sum: { $cond: [{ $eq: ['$status', 'On Trip'] }, 1, 0] } },
        },
      },
      {
        $project: {
          region: '$_id',
          total: 1,
          onTrip: 1,
          utilization: { $multiply: [{ $divide: ['$onTrip', { $cond: [{ $eq: ['$total', 0] }, 1, '$total'] }] }, 100] },
        },
      },
    ]);

    sendSuccess(res, {
      totalVehicles: totalVehiclesCount,
      onTrip: onTripCount,
      maintenance: maintenanceCount,
      available: availableCount,
      overallUtilization: totalVehiclesCount > 0 ? (onTripCount / totalVehiclesCount) * 100 : 0,
      utilizationByRegion,
    }, 'Fleet utilization report generated');
  } catch (error) {
    next(error);
  }
};

export const getDriverPerformanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drivers = await Driver.find().sort({ safetyScore: -1 }).limit(10);
    const performance = await Trip.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: '$driverId',
          tripsCount: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
        },
      },
    ]);

    const result = drivers.map(d => {
      const tripStat = performance.find(p => p._id === d._id);
      return {
        driverId: d._id,
        name: d.name,
        safetyScore: d.safetyScore,
        experience: d.experience,
        tripsCompleted: tripStat?.tripsCount || 0,
        totalDistance: tripStat?.totalDistance || 0,
      };
    });

    sendSuccess(res, result, 'Driver performance report generated');
  } catch (error) {
    next(error);
  }
};

export const getFuelEfficiencyReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const fuelLogs = await FuelLog.aggregate([
      {
        $group: {
          _id: '$vehicleId',
          totalFuel: { $sum: '$fuelQuantity' },
          totalCost: { $sum: '$fuelCost' },
          logsCount: { $sum: 1 },
        },
      },
    ]);

    const vehicles = await Vehicle.find();

    const report = vehicles.map(v => {
      const log = fuelLogs.find(f => f._id === v._id);
      const fuelUsed = log?.totalFuel || 0;
      const odometerTravelled = v.odometer || 1;
      
      return {
        vehicleId: v._id,
        regNumber: v.regNumber,
        name: v.name,
        fuelType: v.fuelType,
        totalFuel: fuelUsed,
        totalCost: log?.totalCost || 0,
        efficiencyRatio: fuelUsed > 0 ? (fuelUsed / odometerTravelled) * 100 : 0, // Liters per 100km approximation
      };
    });

    sendSuccess(res, report, 'Fuel efficiency report generated');
  } catch (error) {
    next(error);
  }
};

export const getExpenseBreakdownReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const breakdown = await Expense.aggregate([
      { $match: { status: 'Approved' } },
      {
        $group: {
          _id: { category: '$category', month: { $substr: ['$date', 0, 7] } },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    sendSuccess(res, breakdown, 'Expense breakdown report generated');
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceCostsReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const costs = await MaintenanceRecord.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: { vehicleId: '$vehicleId', type: '$type' },
          totalCost: { $sum: '$cost' },
          count: { $sum: 1 },
        },
      },
    ]);

    sendSuccess(res, costs, 'Maintenance cost breakdown report generated');
  } catch (error) {
    next(error);
  }
};

export const exportReportData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reportType } = req.query;

    // Simple JSON-to-CSV implementation for reports export
    let data: any[] = [];
    if (reportType === 'fleet-utilization') {
      data = await Vehicle.find({}, { _id: 1, name: 1, regNumber: 1, status: 1, region: 1 });
    } else if (reportType === 'driver-performance') {
      data = await Driver.find({}, { _id: 1, name: 1, safetyScore: 1, status: 1 });
    } else {
      data = await Trip.find({}, { _id: 1, source: 1, destination: 1, status: 1, distance: 1 });
    }

    if (data.length === 0) {
      res.status(200).send('No data available');
      return;
    }

    const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
    const csvRows = [headers.join(',')];

    for (const item of data) {
      const values = headers.map(header => {
        const val = item[header];
        return `"${String(val || '').replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    res.header('Content-Type', 'text/csv');
    res.attachment(`${reportType || 'report'}.csv`);
    res.status(200).send(csvRows.join('\n'));
  } catch (error) {
    next(error);
  }
};
