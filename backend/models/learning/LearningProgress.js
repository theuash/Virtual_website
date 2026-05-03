import mongoose from 'mongoose';

// Tracks per-user, per-tutorial watch progress
const learningProgressSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer',
    required: true,
  },
  tutorialId: {
    type: String,   // matches the id field in SOFTWARE_TUTORIALS on the frontend
    required: true,
  },
  // Total seconds the user has watched (deduplicated — we track unique seconds)
  watchedSeconds: { type: Number, default: 0 },
  // Duration of the video in seconds (set when first reported)
  durationSeconds: { type: Number, default: 0 },
  // Whether the 80% threshold has been crossed
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  // Last reported playback position
  lastPosition: { type: Number, default: 0 },
}, { timestamps: true, collection: 'learning_progress' });

// Compound unique index — one record per user per tutorial
learningProgressSchema.index({ freelancerId: 1, tutorialId: 1 }, { unique: true });

export const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);
