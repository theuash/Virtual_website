import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { SKILLS } from '../config/constants.js';

// ── Independent collection: 'momentum_supervisors' ───────────────
const supervisorSchema = new mongoose.Schema({
  // Auth
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:   { type: String, required: function () { return this.authMethod === 'password'; } },
  authMethod:     { type: String, enum: ['password', 'google'], default: 'password' },
  role:           { type: String, default: 'momentum_supervisor', immutable: true },

  // Profile
  fullName:       { type: String, required: true },
  userId:         { type: String, unique: true, sparse: true },
  phone:          { type: String },
  avatar:         { type: String },
  dateOfBirth:    { type: Date },
  bio:            { type: String, default: '' },
  country:        { type: String },

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

  // Work
  department:             { type: String, enum: SKILLS },
  supervisorCode:         { type: String, unique: true, sparse: true },
  supervisedFreelancers:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' }],
  totalReviews:           { type: Number, default: 0 },
  approvalRate:           { type: Number, default: 0 },
  isOnline:               { type: Boolean, default: false },
}, { timestamps: true, collection: 'momentum_supervisors' });

supervisorSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const MomentumSupervisor = mongoose.model('MomentumSupervisor', supervisorSchema);
