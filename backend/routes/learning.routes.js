import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { LearningVideo } from '../models/LearningVideo.js';

const router = express.Router();

// GET /api/learning/catalogue - Get all learning content grouped by skill/software
router.get('/catalogue', asyncHandler(async (req, res) => {
  const videos = await LearningVideo.find();
  
  // Group by skill → software
  const catalogue = {};
  for (const doc of videos) {
    if (!catalogue[doc.skill]) catalogue[doc.skill] = {};
    catalogue[doc.skill][doc.software] = {
      tutorials: doc.tutorials,
      playlists: doc.playlists,
      crash_courses: doc.crash_courses,
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

export default router;
