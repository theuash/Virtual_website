import mongoose from 'mongoose';
import { User } from './User.js';
import { SKILLS, TIERS } from '../config/constants.js';

const freelancerSchema = new mongoose.Schema({
  primarySkill: { type: String, enum: SKILLS },
  secondarySkills: [{ type: String, enum: SKILLS }],
  tier: { type: String, enum: TIERS, default: 'precrate' },
  dateOfBirth: Date,
  portfolioUrl: String,
  hoursPerWeek: { type: Number },
  preferredContactTime: { type: String },
  onboardingComplete: { type: Boolean, default: false },
  totalEarnings: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  projectsCompleted: { type: Number, default: 0 },
  teamProjectsCompleted: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  promotionEligible: { type: Boolean, default: false }
});
export const Freelancer = User.discriminator('Freelancer', freelancerSchema);
