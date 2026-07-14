import { Router } from 'express';
import { createBooking, verifyPayment, getMyBookings } from '../controllers/booking.controller.js';
import { protect } from '../middlewares/protect.js';

const router = Router();

router.post('/', protect, createBooking);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my-bookings', protect, getMyBookings);

export default router;
