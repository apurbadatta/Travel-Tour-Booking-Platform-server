import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user-profile.controller';
import { protect } from '../middlewares/protect';

const router = Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);

export default router;
