import express from 'express';
import { register, login, getMe, getOtpStatus, registerWithOtp, requestOtpLogin, requestOtpSignup, verifyOtpLogin, verifyOtpSignup } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Traditional auth routes
router.post('/register', register);
router.post('/login', login);

// OTP-based auth routes
router.post('/register-otp', registerWithOtp);
router.post('/otp/request-signup', requestOtpSignup);
router.post('/otp/request-login', requestOtpLogin);
router.post('/otp/verify-login', verifyOtpLogin);
router.post('/otp/verify-signup', verifyOtpSignup);
router.get('/otp/status', getOtpStatus);

// Protected route
router.get('/me', protect, getMe);

export default router;
