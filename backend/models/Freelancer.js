import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { SKILLS, TIERS } from '../config/constants.js';

// ── Independent collection: 'freelancers' ────────────────────────
const freelancerSchema = new mongoose.Schema({
  // Auth
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:   { type: String, required: function () { return this.authMethod === 'password'; } },
  authMethod:     { type: String, enum: ['password', 'google'], default: 'password' },
  role:           { type: String, default: 'freelancer', immutable: true },

  // Profile
  fullName:       { type: String, required: true },
  userId:         { type: String, unique: true, sparse: true },
  phone:          { type: String },
  avatar:         { type: String },
  dateOfBirth:    { type: Date },
  portfolioUrl:   { type: String },
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

  // Skills & onboarding
  primarySkill:       { type: String, enum: SKILLS },
  secondarySkills:    [{ type: String, enum: SKILLS }],
  onboardingComplete: { type: Boolean, default: false },
  hoursPerWeek:       { type: Number },
  preferredContactTime: { type: String },

  // Career
  tier:               { type: String, enum: TIERS, default: 'precrate' },
  totalEarnings:      { type: Number, default: 0 },
  tasksCompleted:     { type: Number, default: 0 },
  projectsCompleted:  { type: Number, default: 0 },
  teamProjectsCompleted: { type: Number, default: 0 },
  rating:             { type: Number, default: 0 },
  promotionEligible:  { type: Boolean, default: false },
  promotionApplied:   { type: Boolean, default: false },
  promotionAppliedAt: { type: Date },
  // For project_initiator tier — clients assigned to them
  assignedClients:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],
  mentorId:           { type: mongoose.Schema.Types.ObjectId, ref: 'MomentumSupervisor' },
}, { timestamps: true, collection: 'freelancers' });

freelancerSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const Freelancer = mongoose.model('Freelancer', freelancerSchema);
