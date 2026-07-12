import { Router } from 'express';
import { createBooking } from '../controllers/booking.controller';
import { protect } from '../middlewares/protect';

const router = Router();

router.post('/', protect, createBooking);

export default router;
