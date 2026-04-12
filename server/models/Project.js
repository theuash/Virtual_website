import mongoose from 'mongoose';
import { SKILLS, PROJECT_STATUS } from '../config/constants.js';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: SKILLS, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  status: { type: String, enum: PROJECT_STATUS, default: 'open' },
  assignedInitiatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  microTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MicroTask' }],
  deliverableUrl: String,
  clientApproved: { type: Boolean, default: false },
  platformFee: { type: Number, default: 0 }
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);
