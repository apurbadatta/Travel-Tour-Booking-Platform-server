import { Router } from 'express';
import {
  getAllTours,
  approveTour,
  rejectTour,
  adminUpdateTour,
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  getAdminBookings,
} from '../controllers/admin.controller';
import { protect } from '../middlewares/protect';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

// All admin routes require auth + admin role
router.use(protect, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/bookings', getAdminBookings);

router.get('/tours', getAllTours);
router.patch('/tours/:id/approve', approveTour);
router.patch('/tours/:id/reject', rejectTour);
router.put('/tours/:id', adminUpdateTour);

export default router;
