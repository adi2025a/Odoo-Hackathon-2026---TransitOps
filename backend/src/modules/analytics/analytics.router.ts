import { Router } from 'express';
import {
  getDashboardKPIs,
  getTrends,
  getHeatmap,
  getFleetHealth
} from './analytics.controller';
import { authenticate } from '../../middleware/authenticate';

export const analyticsRouter = Router();

analyticsRouter.get('/dashboard', authenticate, getDashboardKPIs);
analyticsRouter.get('/trends', authenticate, getTrends);
analyticsRouter.get('/heatmap', authenticate, getHeatmap);
analyticsRouter.get('/fleet-health', authenticate, getFleetHealth);

export default analyticsRouter;
