import { Router } from 'express';
import {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  getVehicleTrips,
  getVehicleMaintenance,
  getVehicleFuel,
  getVehicleExpenses
} from './vehicles.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createVehicleSchema, updateVehicleSchema, updateVehicleStatusSchema } from './vehicles.schema';

export const vehiclesRouter = Router();

vehiclesRouter.get('/', authenticate, authorize('Super Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'), listVehicles);
vehiclesRouter.get('/:id', authenticate, getVehicleById);
vehiclesRouter.post('/', authenticate, authorize('Super Admin', 'Fleet Manager'), validate(createVehicleSchema), createVehicle);
vehiclesRouter.put('/:id', authenticate, authorize('Super Admin', 'Fleet Manager'), validate(updateVehicleSchema), updateVehicle);
vehiclesRouter.delete('/:id', authenticate, authorize('Super Admin'), deleteVehicle);
vehiclesRouter.patch('/:id/status', authenticate, authorize('Super Admin', 'Fleet Manager', 'Dispatcher'), validate(updateVehicleStatusSchema), updateVehicleStatus);

vehiclesRouter.get('/:id/trips', authenticate, getVehicleTrips);
vehiclesRouter.get('/:id/maintenance', authenticate, getVehicleMaintenance);
vehiclesRouter.get('/:id/fuel', authenticate, getVehicleFuel);
vehiclesRouter.get('/:id/expenses', authenticate, getVehicleExpenses);

export default vehiclesRouter;
