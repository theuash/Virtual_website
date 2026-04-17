import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: function() { return this.authMethod === 'password'; } },
  role: { type: String, enum: ROLES, required: true },
  fullName: { type: String, required: true },
  phone: { type: String },
  phoneVerified: { type: Boolean, default: false },
  phoneVerifiedAt: { type: Date },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  // OTP fields for phone-based authentication
  otpVerified: { type: Boolean, default: false },
  otpSentAt: { type: Date },
  otpContext: { type: String, enum: ['signup', 'login', null], default: null },
  otpCodeHash: { type: String },
  otpExpiresAt: { type: Date },
  loginOtpPending: { type: Boolean, default: false },
  authMethod: { type: String, enum: ['password', 'otp', 'google'], default: 'password' },
}, { timestamps: true, discriminatorKey: 'userType' });

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
