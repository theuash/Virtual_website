import fs from 'fs';
import path from 'path';

const serverDir = path.join(process.cwd(), 'server');
process.chdir(serverDir);

// Middleware
fs.writeFileSync('middleware/auth.js', `import jwt from 'jsonwebtoken';
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
`);

fs.writeFileSync('middleware/roleGuard.js', `import { ApiError } from '../utils/ApiError.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized for this role');
    }
    next();
  };
};
`);

// Services
fs.writeFileSync('services/auth.service.js', `import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Client } from '../models/Client.js';
import { Freelancer } from '../models/Freelancer.js';
import bcrypt from 'bcryptjs';

export const generateTokens = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  return { token, refreshToken };
};

export const registerUser = async (data) => {
  const { role, email, password, fullName, skill, dob, company } = data;
  
  const userExists = await User.findOne({ email });
  if (userExists) throw new Error('User already exists');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  let user;
  if (role === 'client') {
    user = await Client.create({ email, passwordHash, role, fullName, companyName: company });
  } else if (role === 'freelancer') {
    user = await Freelancer.create({ email, passwordHash, role, fullName, primarySkill: skill, dateOfBirth: dob });
  } else if (role === 'admin') {
    user = await User.create({ email, passwordHash, role, fullName });
  } else {
    throw new Error('Invalid role');
  }

  const { token, refreshToken } = generateTokens(user._id);
  const userObj = user.toObject();
  delete userObj.passwordHash;
  return { user: userObj, token, refreshToken };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid email or password');
  }

  if (user.isSuspended) throw new Error('Account suspended');

  const { token, refreshToken } = generateTokens(user._id);
  const userObj = user.toObject();
  delete userObj.passwordHash;
  return { user: userObj, token, refreshToken };
};
`);

// Controllers
fs.writeFileSync('controllers/auth.controller.js', `import * as authService from '../services/auth.service.js';
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
`);

// Routes
fs.writeFileSync('routes/auth.routes.js', `import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
`);

console.log('Auth module built.');
