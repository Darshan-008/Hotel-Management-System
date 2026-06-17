import { Router } from 'express';
import { getAllRooms, createRoom, updateRoom } from '../controllers/roomController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getAllRooms);
router.post('/', authMiddleware, adminMiddleware, createRoom);
router.put('/:id', authMiddleware, adminMiddleware, updateRoom);

export default router;
