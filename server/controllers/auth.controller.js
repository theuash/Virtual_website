import * as authService from '../services/auth.service.js';
import * as googleService from '../services/google.service.js';
import { getWhatsAppStatus } from '../services/whatsapp.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Traditional register with password
 */
export const register = asyncHandler(async (req, res) => {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json(new ApiResponse(201, data, 'User registered successfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

/**
 * Register with OTP
 */
export const registerWithOtp = asyncHandler(async (req, res) => {
  try {
    const data = await authService.registerWithOtp(req.body);
    res.status(201).json(new ApiResponse(201, data, data.message));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

/**
 * Traditional login with password
 */
export const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser(email, password);
    const message = data.requiresTwoFactor
      ? data.message || 'Password verified. Complete phone verification to log in.'
      : 'User logged in successfully';
    res.json(new ApiResponse(200, data, message));
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});

/**
 * Request OTP for login
 */
export const requestOtpLogin = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }
    const data = await authService.loginWithOtpRequest(email);
    res.json(new ApiResponse(200, data, data.message));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

/**
 * Request OTP for signup verification resend
 */
export const requestOtpSignup = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }
    const data = await authService.requestSignupOtp(email);
    res.json(new ApiResponse(200, data, data.message));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

/**
 * Verify OTP for login
 */
export const verifyOtpLogin = asyncHandler(async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      throw new ApiError(400, 'Email and phone OTP token are required');
    }
    const data = await authService.verifyOtpAndLogin(email, token);
    res.json(new ApiResponse(200, data, 'Phone verified. Logged in successfully'));
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});

/**
 * Verify OTP for signup
 */
export const verifyOtpSignup = asyncHandler(async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      throw new ApiError(400, 'Email and phone OTP token are required');
    }
    const data = await authService.verifySignupOtp(email, token);
    res.json(new ApiResponse(200, data, data.message));
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});

/**
 * Get current user
 */
export const getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, req.user));
});

export const getOtpStatus = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, getWhatsAppStatus(), 'OTP service status fetched'));
});

/**
 * Sign up with Google
 */
export const signupWithGoogle = asyncHandler(async (req, res) => {
  try {
    const { token, role } = req.body;
    if (!token) {
      throw new ApiError(400, 'Google token is required');
    }
    if (!role || !['client', 'freelancer', 'admin'].includes(role)) {
      throw new ApiError(400, 'Valid role is required (client, freelancer, or admin)');
    }
    const data = await googleService.signupWithGoogle(token, role);
    res.status(201).json(new ApiResponse(201, data, data.message));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

/**
 * Login with Google
 */
export const loginWithGoogle = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new ApiError(400, 'Google token is required');
    }
    const data = await googleService.loginWithGoogle(token);
    res.json(new ApiResponse(200, data, data.message));
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});
