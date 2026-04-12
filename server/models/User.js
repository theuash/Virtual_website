import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ROLES, required: true },
  fullName: { type: String, required: true },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
}, { timestamps: true, discriminatorKey: 'userType' });

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
