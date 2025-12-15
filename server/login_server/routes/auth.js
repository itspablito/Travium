import express from 'express';
import { register, login, updateProfile } from '../controllers/authcontroller.js';
import { authenticateToken } from '../controllers/authMiddleware.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', authenticateToken, updateProfile);

export default router;
