import { Router } from 'express';
import { signup, login, getProfile, registerStaff, getStaffList, deleteStaff } from '../controllers/authController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, getProfile);

// Staff management routes - restricted to admin staff
router.post('/register-staff', authMiddleware, adminMiddleware, registerStaff);
router.get('/staff', authMiddleware, adminMiddleware, getStaffList);
router.delete('/staff/:id', authMiddleware, adminMiddleware, deleteStaff);

export default router;
