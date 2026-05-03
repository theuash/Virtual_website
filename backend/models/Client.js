import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { generateClientId } from '../utils/idGenerator.js';

// ── Independent collection: 'clients' ────────────────────────────
const clientSchema = new mongoose.Schema({
  // Auth
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:   { type: String, required: function () { return this.authMethod === 'password'; } },
  authMethod:     { type: String, enum: ['password', 'google'], default: 'password' },
  role:           { type: String, default: 'client', immutable: true },

  // Profile
  fullName:       { type: String, required: true },
  clientId:       { type: String, unique: true, sparse: true },
  clientType:     { type: String, enum: ['CR', 'CP', 'CS'], default: 'CR' },
  userId:         { type: String, unique: true, sparse: true },
  phone:          { type: String },
  avatar:         { type: String },
  companyName:    { type: String, default: '' },

  // Verification
  verificationStatus: { type: String, enum: ['unverified', 'pending', 'on_hold', 'verified'], default: 'unverified' },
  country:          { type: String },
  address:          { type: String },
  verificationSubmittedAt: { type: Date },
  assignedSupervisorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'MomentumSupervisor' },
  
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

  // Onboarding
  onboardingComplete:   { type: Boolean, default: false },
  objective:            { type: String, enum: ['content_creation', 'personal', 'business', 'agency', 'other'], default: null },
  platforms:            [{ type: String }],
  platformHandles:      { type: Map, of: String, default: {} },
  city:                 { type: String },
  timezone:             { type: String },
  servicesNeeded:       [{ type: String }],
  budgetMin:            { type: Number },
  budgetMax:            { type: Number },
  budgetCurrency:       { type: String, default: 'INR' },
  availableDays:        [{ type: String }],
  availableTimeSlots:   [{ type: String }],
  preferredCurrency:    { type: String, default: 'INR' },
}, { timestamps: true, collection: 'clients' });

clientSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

clientSchema.pre('save', async function () {
  if (this.isNew && !this.clientId) {
    // Determine country code (default to IN if not set)
    const country = this.country || 'IN';
    const code = country.length >= 2 ? country.slice(0, 2).toUpperCase() : 'IN';
    
    let unique = false;
    let attempts = 0;
    while (!unique && attempts < 10) {
      const candidate = generateClientId(code, this.clientType);
      const existing = await mongoose.models.Client.findOne({ clientId: candidate });
      if (!existing) {
        this.clientId = candidate;
        unique = true;
      }
      attempts++;
    }
    
    if (!unique) {
      // Fallback or error
      this.clientId = generateClientId(code, this.clientType) + Math.floor(Math.random() * 100);
    }
  }
});

export const Client = mongoose.model('Client', clientSchema);
