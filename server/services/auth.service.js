import jwt from 'jsonwebtoken';
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
