import { Router } from 'express';
import {
  listMaintenanceRecords,
  getMaintenanceRecordById,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  completeMaintenanceRecord,
  getMaintenanceByVehicle,
  getUpcomingMaintenance
} from './maintenance.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createMaintenanceSchema, updateMaintenanceSchema } from './maintenance.schema';

export const maintenanceRouter = Router();

maintenanceRouter.get('/', authenticate, listMaintenanceRecords);
maintenanceRouter.get('/upcoming', authenticate, getUpcomingMaintenance);
maintenanceRouter.get('/vehicle/:id', authenticate, getMaintenanceByVehicle);
maintenanceRouter.get('/:id', authenticate, getMaintenanceRecordById);

maintenanceRouter.post('/', authenticate, authorize('Super Admin', 'Fleet Manager', 'Safety Officer'), validate(createMaintenanceSchema), createMaintenanceRecord);
maintenanceRouter.put('/:id', authenticate, authorize('Super Admin', 'Fleet Manager'), validate(updateMaintenanceSchema), updateMaintenanceRecord);
maintenanceRouter.patch('/:id/complete', authenticate, authorize('Super Admin', 'Fleet Manager'), completeMaintenanceRecord);

export default maintenanceRouter;
