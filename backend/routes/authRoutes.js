import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  getMe,
  checkUsernameAvailability,
} from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidators.js';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Stricter limiter on auth endpoints to slow down brute-force / credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/check-username/:username', checkUsernameAvailability);

export default router;
