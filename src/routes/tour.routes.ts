import { Router } from 'express';
import {
  getTours,
  getTourById,
  getCategories,
  getDestinations,
  getTourReviews,
  getRelatedTours,
  createTour,
  getMyTours,
  updateTour,
  deleteTour,
} from '../controllers/tour.controller';
import { protect } from '../middlewares/protect';

const router = Router();

router.get('/categories', getCategories);
router.get('/destinations', getDestinations);
router.get('/my-tours', protect, getMyTours);
router.get('/', getTours);
router.get('/:id/reviews', getTourReviews);
router.get('/:id/related', getRelatedTours);
router.get('/:id', getTourById);

// Protected routes
router.post('/', protect, createTour);
router.put('/:id', protect, updateTour);
router.delete('/:id', protect, deleteTour);

export default router;
