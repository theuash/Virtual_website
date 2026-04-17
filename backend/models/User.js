import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Independent collection: 'admins' ─────────────────────────────
// "User" name kept for backward compat with auth middleware imports
const adminSchema = new mongoose.Schema({
  // Auth
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:   { type: String, required: function () { return this.authMethod === 'password'; } },
  authMethod:     { type: String, enum: ['password', 'google'], default: 'password' },
  role:           { type: String, default: 'admin', immutable: true },

  // Profile
  fullName:       { type: String, required: true },
  phone:          { type: String },
  avatar:         { type: String },

  // Verification
  isVerified:     { type: Boolean, default: false },
  isSuspended:    { type: Boolean, default: false },
  phoneVerified:  { type: Boolean, default: false },
  phoneVerifiedAt:{ type: Date },

  // OTP
  otpCodeHash:    { type: String },
  otpExpiresAt:   { type: Date },
  otpContext:     { type: String, enum: ['signup', 'login', null], default: null },
  otpSentAt:      { type: Date },
  loginOtpPending:{ type: Boolean, default: false },
}, { timestamps: true, collection: 'admins' });

adminSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model('User', adminSchema);
