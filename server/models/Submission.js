import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  microTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'MicroTask', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  notes: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  feedback: String
}, { timestamps: true });

export const Submission = mongoose.model('Submission', submissionSchema);
