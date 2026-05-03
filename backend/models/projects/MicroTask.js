import mongoose from 'mongoose';
import { TASK_STATUS, SKILLS } from '../../config/constants.js';

const microTaskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skillRequired: { type: String, enum: SKILLS, required: true },
  status: { type: String, enum: TASK_STATUS, default: 'unassigned' },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  earnings: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  mentorNotes: String
}, { timestamps: true });

export const MicroTask = mongoose.model('MicroTask', microTaskSchema);
