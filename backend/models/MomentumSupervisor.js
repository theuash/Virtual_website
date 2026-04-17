import mongoose from 'mongoose';
import { User } from './User.js';
import { SKILLS } from '../config/constants.js';

const momentumSupervisorSchema = new mongoose.Schema({
  department: { type: String, enum: SKILLS },
  supervisedFreelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalReviews: { type: Number, default: 0 },
  approvalRate: { type: Number, default: 0 },
  dateOfBirth: Date,
  bio: { type: String, default: '' },
});

export const MomentumSupervisor = User.discriminator('MomentumSupervisor', momentumSupervisorSchema);
