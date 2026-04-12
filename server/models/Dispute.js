import mongoose from 'mongoose';
import { DISPUTE_STATUS } from '../config/constants.js';

const disputeSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  againstUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true },
  evidence: [{
    fileUrl: String,
    description: String
  }],
  status: { type: String, enum: DISPUTE_STATUS, default: 'open' },
  resolution: String,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Dispute = mongoose.model('Dispute', disputeSchema);
