import { Router } from 'express';
import {
  getTours,
  getTourById,
  getCategories,
  getDestinations,
} from '../controllers/tour.controller';

const router = Router();

router.get('/categories', getCategories);
router.get('/destinations', getDestinations);
router.get('/', getTours);
router.get('/:id', getTourById);

export default router;
