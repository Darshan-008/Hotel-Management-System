import { Router } from 'express';
import { getAllFeedback, createFeedback } from '../controllers/feedbackController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getAllFeedback);
router.post('/', authMiddleware, createFeedback);

export default router;
