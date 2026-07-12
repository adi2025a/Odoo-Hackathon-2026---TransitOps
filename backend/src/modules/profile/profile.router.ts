import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword
} from './profile.controller';
import { authenticate } from '../../middleware/authenticate';

export const profileRouter = Router();

profileRouter.get('/', authenticate, getMyProfile);
profileRouter.put('/', authenticate, updateMyProfile);
profileRouter.put('/password', authenticate, changeMyPassword);

export default profileRouter;
