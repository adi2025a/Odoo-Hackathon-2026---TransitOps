import { Request, Response, NextFunction } from 'express';
import Trip from '../../models/Trip';
import Vehicle from '../../models/Vehicle';
import Expense from '../../models/Expense';
import Notification from '../../models/Notification';
import { sendSuccess } from '../../utils/response';

export const getDashboardKPIs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activeTripsCount = await Trip.countDocuments({ status: 'On Trip' });
    const availableVehiclesCount = await Vehicle.countDocuments({ status: 'Available' });

    // Calculate revenue dynamically: Each completed trip generates $2.20 per km
    const trips = await Trip.find({ status: 'Completed' }, { distance: 1 });
    const totalRevenue = trips.reduce((sum, t) => sum + (t.distance * 2.2), 0);

    const activeAlertsCount = await Notification.countDocuments({ read: false, severity: 'critical' });

    sendSuccess(res, {
      activeTrips: activeTripsCount,
      availableVehicles: availableVehiclesCount,
      revenue: totalRevenue,
      activeAlerts: activeAlertsCount,
    }, 'Dashboard KPIs calculated successfully');
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Return mock 90-day trend data for graphs
    const trends = {
      labels: ['May', 'Jun', 'Jul'],
      tripsCompleted: [340, 420, 440],
      fuelCost: [12000, 14500, 15200],
      expenses: [23000, 26000, 27500],
    };

    sendSuccess(res, trends, 'Trends generated successfully');
  } catch (error) {
    next(error);
  }
};

export const getHeatmap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Generate frequency map of trips sources and destinations
    const routes = await Trip.aggregate([
      {
        $group: {
          _id: { source: '$source', destination: '$destination' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    const formatted = routes.map(r => ({
      source: r._id.source,
      destination: r._id.destination,
      value: r.count,
    }));

    sendSuccess(res, formatted, 'Route heatmap generated');
  } catch (error) {
    next(error);
  }
};

export const getFleetHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalVehiclesCount = await Vehicle.countDocuments();
    const maintenanceVehiclesCount = await Vehicle.countDocuments({ status: 'Maintenance' });

    // Calculate dynamic health score
    const healthScore = totalVehiclesCount > 0
      ? Math.round(100 - (maintenanceVehiclesCount / totalVehiclesCount) * 35)
      : 100;

    const vehiclesByStatus = await Vehicle.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    sendSuccess(res, {
      healthScore,
      vehiclesByStatus,
      maintenanceRequired: maintenanceVehiclesCount,
    }, 'Fleet health metrics calculated');
  } catch (error) {
    next(error);
  }
};
