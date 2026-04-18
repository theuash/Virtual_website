import mongoose from 'mongoose';

const learningVideoSchema = new mongoose.Schema({
  // Unique identifier used on the frontend (matches tutorialId in LearningProgress)
  id:           { type: String, required: true, unique: true },

  // Display info
  title:        { type: String, required: true },
  desc:         { type: String, default: '' },
  duration:     { type: String, default: '' },   // human-readable e.g. "14 min"
  level:        { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  instructor:   { type: String, default: '' },

  // YouTube video ID (the part after ?v= in the URL)
  youtubeId:    { type: String, required: true },

  // Categorisation
  skill:        { type: String, required: true },   // e.g. 'video_editing'
  software:     { type: String, required: true },   // e.g. 'DaVinci Resolve'
}, { timestamps: true, collection: 'learning_videos' });

export const LearningVideo = mongoose.model('LearningVideo', learningVideoSchema);
