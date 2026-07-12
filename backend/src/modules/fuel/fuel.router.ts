import { Router } from 'express';
import {
  listFuelLogs,
  getFuelLogById,
  createFuelLog,
  getFuelLogsByVehicle,
  getFuelStats
} from './fuel.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { createFuelLogSchema } from './fuel.schema';

export const fuelRouter = Router();

fuelRouter.get('/', authenticate, listFuelLogs);
fuelRouter.get('/stats', authenticate, getFuelStats);
fuelRouter.get('/vehicle/:id', authenticate, getFuelLogsByVehicle);
fuelRouter.get('/:id', authenticate, getFuelLogById);
fuelRouter.post('/', authenticate, validate(createFuelLogSchema), createFuelLog);

export default fuelRouter;
