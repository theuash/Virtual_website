import * as authService from '../services/auth.service.js';
import * as googleService from '../services/google.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';

/**
 * Traditional register with password
 */
export const register = asyncHandler(async (req, res) => {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json(new ApiResponse(201, data, 'User registered successfully'));
  } catch (error) {
    console.error('Registration Error:', error);
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
    console.error('OTP Registration Error:', error);
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
  const { email, token, signupData } = req.body;
  if (!email || !token) {
    throw new ApiError(400, 'Email and OTP token are required');
  }
  if (!signupData) {
    throw new ApiError(400, 'Signup data is required');
  }
  const data = await authService.verifySignupOtp(email, token, signupData);
  res.json(new ApiResponse(200, data, data.message));
});

/**
 * Get current user — always fetches fresh from DB so avatar/profile changes are reflected
 */
export const getMe = asyncHandler(async (req, res) => {
  // Prevent browser caching so profile updates (avatar etc.) are always fresh
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  const { findUserById } = await import('../utils/findUser.js');
  const fresh = await findUserById(req.user._id);
  if (!fresh) throw new ApiError(404, 'User not found');
  res.json(new ApiResponse(200, fresh));
});

/**
 * Refresh access token using a valid refresh token.
 * Body: { refreshToken }
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw new ApiError(400, 'Refresh token is required');

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const { findUserById } = await import('../utils/findUser.js');
    const user = await findUserById(decoded.id);
    if (!user) throw new ApiError(401, 'User not found');
    if (user.isSuspended) throw new ApiError(403, 'Account suspended');

    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json(new ApiResponse(200, { token: newToken }, 'Token refreshed'));
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
});

/**
 * Sign up with Google
 */
export const signupWithGoogle = asyncHandler(async (req, res) => {
  try {
    const { token, role } = req.body;
    console.log('[Google Signup] token present:', !!token, 'role:', role);
    if (!token) {
      throw new ApiError(400, 'Google token is required');
    }
    if (!role || !['client', 'freelancer', 'admin'].includes(role)) {
      throw new ApiError(400, 'Valid role is required (client, freelancer, or admin)');
    }
    const data = await googleService.signupWithGoogle(token, role);
    res.status(201).json(new ApiResponse(201, data, data.message));
  } catch (error) {
    console.error('[Google Signup Error]:', error.message);
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
