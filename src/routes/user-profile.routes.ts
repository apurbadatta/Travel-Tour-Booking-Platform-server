import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user-profile.controller.js';
import { protect } from '../middlewares/protect.js';

const router = Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);

export default router;
