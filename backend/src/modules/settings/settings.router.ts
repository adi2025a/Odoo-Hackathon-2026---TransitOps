import { Router } from 'express';
import {
  getSystemSettings,
  updateSystemSettings,
  listAllUsers,
  createUserAccount,
  updateUserAccount,
  deactivateUserAccount
} from './settings.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

export const settingsRouter = Router();

// Require Super Admin for all settings endpoints
settingsRouter.use(authenticate, authorize('Super Admin'));

settingsRouter.get('/', getSystemSettings);
settingsRouter.put('/', updateSystemSettings);

settingsRouter.get('/users', listAllUsers);
settingsRouter.post('/users', createUserAccount);
settingsRouter.put('/users/:id', updateUserAccount);
settingsRouter.delete('/users/:id', deactivateUserAccount);

export default settingsRouter;
