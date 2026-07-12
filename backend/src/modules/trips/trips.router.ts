import { Router } from 'express';
import {
  listTrips,
  getTripById,
  createTrip,
  updateTrip,
  updateTripStatus,
  completeTrip,
  getActiveTrips,
  getTripsByDriverId
} from './trips.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createTripSchema, updateTripSchema, updateTripStatusSchema, completeTripSchema } from './trips.schema';

export const tripsRouter = Router();

tripsRouter.get('/', authenticate, listTrips);
tripsRouter.get('/active', authenticate, getActiveTrips);
tripsRouter.get('/driver/:driverId', authenticate, getTripsByDriverId);
tripsRouter.get('/:id', authenticate, getTripById);

tripsRouter.post('/', authenticate, authorize('Super Admin', 'Dispatcher'), validate(createTripSchema), createTrip);
tripsRouter.put('/:id', authenticate, authorize('Super Admin', 'Dispatcher'), validate(updateTripSchema), updateTrip);
tripsRouter.delete('/:id', authenticate, authorize('Super Admin', 'Dispatcher'), updateTripStatus); // Cancel trip is update status
tripsRouter.patch('/:id/status', authenticate, validate(updateTripStatusSchema), updateTripStatus);
tripsRouter.post('/:id/complete', authenticate, validate(completeTripSchema), completeTrip);

export default tripsRouter;
