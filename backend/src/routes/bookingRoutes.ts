import { Router } from 'express';
import { getAllBookings, createBooking } from '../controllers/bookingController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, adminMiddleware, getAllBookings);
router.post('/', authMiddleware, createBooking);

export default router;
