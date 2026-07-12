import { Router } from 'express';
import {
  listDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  updateDriverStatus,
  getDriverTrips,
  getDriverSafetyHistory
} from './drivers.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createDriverSchema, updateDriverSchema, updateDriverStatusSchema } from './drivers.schema';

export const driversRouter = Router();

driversRouter.get('/', authenticate, authorize('Super Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer'), listDrivers);
driversRouter.get('/:id', authenticate, getDriverById);
driversRouter.post('/', authenticate, authorize('Super Admin', 'Fleet Manager'), validate(createDriverSchema), createDriver);
driversRouter.put('/:id', authenticate, authorize('Super Admin', 'Fleet Manager'), validate(updateDriverSchema), updateDriver);
driversRouter.delete('/:id', authenticate, authorize('Super Admin'), deleteDriver);
driversRouter.patch('/:id/status', authenticate, authorize('Super Admin', 'Fleet Manager', 'Dispatcher'), validate(updateDriverStatusSchema), updateDriverStatus);

driversRouter.get('/:id/trips', authenticate, getDriverTrips);
driversRouter.get('/:id/safety', authenticate, getDriverSafetyHistory);

export default driversRouter;
