import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/v1/auth/signup
 * @desc Register a new user
 * @access Public
 */
router.post('/signup', authController.register);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/v1/auth/send-otp
 * @desc Send OTP to phone number
 * @access Public
 */
router.post('/send-otp', authController.sendOTP);

/**
 * @route POST /api/v1/auth/verify-otp
 * @desc Verify OTP
 * @access Public
 */
router.post('/verify-otp', authController.verifyOTP);

/**
 * @route GET /api/v1/auth/profile/:userId
 * @desc Get user profile
 * @access Private (will add authentication middleware later)
 */
router.get('/profile/:userId', authController.getProfile);

export default router;
