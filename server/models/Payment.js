import mongoose from 'mongoose';
import { PAYMENT_TYPE, PAYMENT_STATUS } from '../config/constants.js';

const paymentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  netAmount: { type: Number },
  type: { type: String, enum: PAYMENT_TYPE, required: true },
  status: { type: String, enum: PAYMENT_STATUS, default: 'pending' },
  stripePaymentIntentId: String,
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
