import mongoose from 'mongoose';
import { SKILLS, PROJECT_STATUS } from '../config/constants.js';

const projectSchema = new mongoose.Schema({
  // ── Core ──────────────────────────────────────────────────────
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category:    { type: String, enum: SKILLS, required: true },
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  status:      { type: String, enum: PROJECT_STATUS, default: 'open' },
  currency:    { type: String, enum: ['INR', 'USD'], default: 'INR' },

  // ── Scheduling ────────────────────────────────────────────────
  startDate:        { type: Date, required: true },
  durationDays:     { type: Number, required: true },          // estimated project duration
  deadline:         { type: Date },                            // computed: startDate + durationDays
  timeSensitive:    { type: Boolean, default: false },         // +60% rate surcharge

  // ── Pricing ───────────────────────────────────────────────────
  // For service-based pricing (from our catalogue)
  serviceId:        { type: String },                          // matches LearningVideo/Pricing id
  serviceName:      { type: String },
  unit:             { type: String, enum: ['min', 'sec', 'design', 'concept', 'set', 'template', 'menu'] },
  quantity:         { type: Number },                          // minutes / seconds / units
  ratePerUnit:      { type: Number },                          // ₹ per unit (from pricing DB)
  baseAmount:       { type: Number },                          // ratePerUnit × quantity
  timeSensitiveFee: { type: Number, default: 0 },              // +60% if timeSensitive
  discountAmount:   { type: Number, default: 0 },              // first-project discount
  platformFee:      { type: Number, default: 0 },              // +5% of (subtotal - discount)
  couponDiscount:   { type: Number, default: 0 },              // additional coupon discount
  totalAmount:      { type: Number },                          // subtotal - discount + platformFee - couponDiscount
  isFirstProject:   { type: Boolean, default: false },
  appliedCouponCode: { type: String },

  // For open/custom projects
  isOpenProject:    { type: Boolean, default: false },
  openBudget:       { type: Number },                          // client's own budget
  openUnit:         { type: String, enum: ['min', 'sec'] },

  // ── Experience format ─────────────────────────────────────────
  // 'elite'    = standard pricing, ready to checkout
  // 'priority' = connect to Momentum Supervisor first
  experienceFormat: { type: String, enum: ['elite', 'priority'], default: 'elite' },

  // ── Extras ────────────────────────────────────────────────────
  preferredSoftware: [{ type: String }],
  referenceLinks:    [{ type: String }],
  attachments:       [{ type: String }],                       // file URLs
  ndaRequired:       { type: Boolean, default: false },

  // ── Payment stages ────────────────────────────────────────────
  // 30% upfront after initiator assigned, 70% on completion
  depositPaid:      { type: Boolean, default: false },         // 30% paid
  depositAmount:    { type: Number, default: 0 },
  finalPaid:        { type: Boolean, default: false },         // remaining 70% paid
  revisionFeeRate:  { type: Number, default: 0 },              // 0–30% requested by initiator
  revisionFeeAmount:{ type: Number, default: 0 },

  // ── Assignment ────────────────────────────────────────────────
  assignedInitiatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },
  // For group projects — multiple initiators collaborate
  coInitiators:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' }],
  // Project type: 'team' = initiator leads crates, 'group' = multi-initiator, 'personal' = solo initiator
  projectType:         { type: String, enum: ['team', 'group', 'personal'], default: 'team' },
  // Deadline extension tracking
  originalDeadline:    { type: Date },
  deadlineExtended:    { type: Boolean, default: false },
  deadlineExtensionReason: { type: String },
  microTasks:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'MicroTask' }],
  deliverableUrl:      { type: String },
  clientApproved:      { type: Boolean, default: false },

  // Legacy budget field (kept for backward compat)
  budget: { type: Number },
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);
