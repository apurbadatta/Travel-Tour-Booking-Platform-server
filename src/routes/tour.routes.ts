import { Router } from 'express';
import {
  getTours,
  getTourById,
  getCategories,
  getDestinations,
  getTourReviews,
  getRelatedTours,
} from '../controllers/tour.controller';

const router = Router();

router.get('/categories', getCategories);
router.get('/destinations', getDestinations);
router.get('/', getTours);
router.get('/:id/reviews', getTourReviews);
router.get('/:id/related', getRelatedTours);
router.get('/:id', getTourById);

export default router;
