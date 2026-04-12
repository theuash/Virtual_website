import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const register = asyncHandler(async (req, res) => {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json(new ApiResponse(201, data, 'User registered successfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

export const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser(email, password);
    res.json(new ApiResponse(200, data, 'User logged in successfully'));
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, req.user));
});
