import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) throw new ApiError(401, 'Not authorized, no token');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) throw new ApiError(401, 'User not found');
    if (req.user.isSuspended) throw new ApiError(403, 'Account suspended');
    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized, token failed');
  }
});
