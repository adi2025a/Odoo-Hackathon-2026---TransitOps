import { Router } from 'express';
import {
  getTripSummaryReport,
  getFleetUtilizationReport,
  getDriverPerformanceReport,
  getFuelEfficiencyReport,
  getExpenseBreakdownReport,
  getMaintenanceCostsReport,
  exportReportData
} from './reports.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

export const reportsRouter = Router();

reportsRouter.get('/trip-summary', authenticate, getTripSummaryReport);
reportsRouter.get('/fleet-utilization', authenticate, getFleetUtilizationReport);
reportsRouter.get('/driver-performance', authenticate, getDriverPerformanceReport);
reportsRouter.get('/fuel-efficiency', authenticate, getFuelEfficiencyReport);
reportsRouter.get('/expense-breakdown', authenticate, getExpenseBreakdownReport);
reportsRouter.get('/maintenance-costs', authenticate, getMaintenanceCostsReport);
reportsRouter.get('/export', authenticate, authorize('Super Admin', 'Fleet Manager', 'Financial Analyst'), exportReportData);

export default reportsRouter;
