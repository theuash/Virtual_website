import express from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { LearningVideo } from '../../models/learning/LearningVideo.js';
import { learningVideos } from '../../data/learningVideos.js';

const router = express.Router();

// GET /api/learning/catalogue - Get all learning content grouped by skill/software
router.get('/catalogue', asyncHandler(async (req, res) => {
  const videos = await LearningVideo.find().lean();

  // Build catalogue: skill → software → { tutorials, playlists, crash_courses }
  const catalogue = {};
  for (const doc of videos) {
    if (!catalogue[doc.skill]) catalogue[doc.skill] = {};
    catalogue[doc.skill][doc.software] = {
      tutorials: Array.isArray(doc.tutorials) ? doc.tutorials : [],
      playlists: Array.isArray(doc.playlists) ? doc.playlists : [],
      crash_courses: Array.isArray(doc.crash_courses) ? doc.crash_courses : [],
    };
  }

  res.json(new ApiResponse(200, catalogue, 'Catalogue fetched'));
}));

// GET /api/learning/tutorials?skill=video_editing&software=DaVinci+Resolve
router.get('/tutorials', asyncHandler(async (req, res) => {
  const { skill, software } = req.query;
  
  if (!skill || !software) {
    return res.status(400).json(new ApiResponse(400, null, 'skill and software are required'));
  }
  
  const doc = await LearningVideo.findOne({ skill, software });
  if (!doc) {
    return res.status(404).json(new ApiResponse(404, [], 'No tutorials found'));
  }
  
  res.json(new ApiResponse(200, doc.tutorials, 'Tutorials fetched'));
}));

// GET /api/learning/playlists?skill=video_editing&software=DaVinci+Resolve
router.get('/playlists', asyncHandler(async (req, res) => {
  const { skill, software } = req.query;
  
  if (!skill || !software) {
    return res.status(400).json(new ApiResponse(400, null, 'skill and software are required'));
  }
  
  const doc = await LearningVideo.findOne({ skill, software });
  if (!doc) {
    return res.status(404).json(new ApiResponse(404, [], 'No playlists found'));
  }
  
  res.json(new ApiResponse(200, doc.playlists, 'Playlists fetched'));
}));

// GET /api/learning/playlists/:id - Get specific playlist
router.get('/playlists/:id', asyncHandler(async (req, res) => {
  const { skill, software } = req.query;
  
  if (!skill || !software) {
    return res.status(400).json(new ApiResponse(400, null, 'skill and software are required'));
  }
  
  const doc = await LearningVideo.findOne({ skill, software });
  if (!doc) {
    return res.status(404).json(new ApiResponse(404, null, 'Document not found'));
  }
  
  const playlist = doc.playlists.find(p => p.id === req.params.id);
  if (!playlist) {
    return res.status(404).json(new ApiResponse(404, null, 'Playlist not found'));
  }
  
  res.json(new ApiResponse(200, playlist, 'Playlist fetched'));
}));

// GET /api/learning/crashcourses?skill=video_editing&software=DaVinci+Resolve
router.get('/crashcourses', asyncHandler(async (req, res) => {
  const { skill, software } = req.query;
  
  if (!skill || !software) {
    return res.status(400).json(new ApiResponse(400, null, 'skill and software are required'));
  }
  
  const doc = await LearningVideo.findOne({ skill, software });
  if (!doc) {
    return res.status(404).json(new ApiResponse(404, [], 'No crash courses found'));
  }
  
  res.json(new ApiResponse(200, doc.crash_courses, 'Crash courses fetched'));
}));

// GET /api/learning/crashcourses/:id - Get specific crash course
router.get('/crashcourses/:id', asyncHandler(async (req, res) => {
  const { skill, software } = req.query;
  
  if (!skill || !software) {
    return res.status(400).json(new ApiResponse(400, null, 'skill and software are required'));
  }
  
  const doc = await LearningVideo.findOne({ skill, software });
  if (!doc) {
    return res.status(404).json(new ApiResponse(404, null, 'Document not found'));
  }
  
  const course = doc.crash_courses.find(c => c.id === req.params.id);
  if (!course) {
    return res.status(404).json(new ApiResponse(404, null, 'Crash course not found'));
  }
  
  res.json(new ApiResponse(200, course, 'Crash course fetched'));
}));

// POST /api/learning/seed - Reseed the database (admin only)
router.post('/seed', asyncHandler(async (req, res) => {
  // Drop the collection entirely to remove old indexes
  await LearningVideo.collection.drop().catch(() => {
    console.log('ℹ Collection did not exist, creating fresh');
  });
  console.log('✓ Dropped collection and all indexes');

  // Wipe the entire collection (safety measure)
  await LearningVideo.deleteMany({});
  console.log('✓ Cleared all learning_videos documents');

  // Insert fresh
  const results = [];
  for (const doc of learningVideos) {
    try {
      await LearningVideo.create(doc);
      results.push({ skill: doc.skill, software: doc.software, status: 'success' });
      console.log(`✓ Created: ${doc.skill} - ${doc.software}`);
    } catch (error) {
      results.push({ skill: doc.skill, software: doc.software, status: 'failed', error: error.message });
      console.error(`❌ Failed to create ${doc.skill} - ${doc.software}:`, error.message);
    }
  }

  // Verify
  const all = await LearningVideo.find().lean();
  console.log(`\n✅ Total documents: ${all.length}`);

  res.json(new ApiResponse(200, { results, total: all.length }, 'Database seeded successfully'));
}));

export default router;
