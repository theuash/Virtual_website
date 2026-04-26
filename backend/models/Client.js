import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Independent collection: 'clients' ────────────────────────────
const clientSchema = new mongoose.Schema({
  // Auth
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:   { type: String, required: function () { return this.authMethod === 'password'; } },
  authMethod:     { type: String, enum: ['password', 'google'], default: 'password' },
  role:           { type: String, default: 'client', immutable: true },

  // Profile
  fullName:       { type: String, required: true },
  userId:         { type: String, unique: true, sparse: true },
  phone:          { type: String },
  avatar:         { type: String },
  companyName:    { type: String, default: '' },

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

  // Stats
  totalSpent:         { type: Number, default: 0 },
  activeProjects:     { type: Number, default: 0 },
  completedProjects:  { type: Number, default: 0 },
}, { timestamps: true, collection: 'clients' });

clientSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const Client = mongoose.model('Client', clientSchema);
