import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  youtubeId: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  duration: { type: String, default: '' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
});

const playlistSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  videos: [videoSchema],
});

const crashCourseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  videos: [videoSchema],
});

const tutorialSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  duration: { type: String, default: '' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  instructor: { type: String, default: '' },
  youtubeId: { type: String, required: true },
});

const learningVideoSchema = new mongoose.Schema({
  // Skill and software combination (unique)
  skill: { type: String, required: true },
  software: { type: String, required: true },

  // Tutorials array
  tutorials: [tutorialSchema],

  // Playlists array
  playlists: [playlistSchema],

  // Crash courses array
  crash_courses: [crashCourseSchema],
}, { timestamps: true, collection: 'learning_videos' });

// Ensure unique combination of skill and software
learningVideoSchema.index({ skill: 1, software: 1 }, { unique: true });

export const LearningVideo = mongoose.model('LearningVideo', learningVideoSchema);
