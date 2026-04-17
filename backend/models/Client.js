import mongoose from 'mongoose';
import { User } from './User.js';

const clientSchema = new mongoose.Schema({
  companyName: String,
  totalSpent: { type: Number, default: 0 },
  activeProjects: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 }
});
export const Client = User.discriminator('Client', clientSchema);
