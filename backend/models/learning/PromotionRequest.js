import mongoose from 'mongoose';
import { TIERS } from '../../config/constants.js';

const promotionRequestSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentTier: { type: String, enum: TIERS, required: true },
  requestedTier: { type: String, enum: TIERS, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: String
}, { timestamps: true });

export const PromotionRequest = mongoose.model('PromotionRequest', promotionRequestSchema);
