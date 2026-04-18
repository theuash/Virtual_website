import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { LearningVideo } from '../models/LearningVideo.js';

const router = express.Router();

// GET /api/learning/videos?skill=video_editing&software=DaVinci+Resolve
router.get('/videos', asyncHandler(async (req, res) => {
  const { skill, software } = req.query;
  const filter = {};
  if (skill)    filter.skill    = skill;
  if (software) filter.software = software;
  const videos = await LearningVideo.find(filter).sort({ level: 1 });
  res.json(new ApiResponse(200, videos, 'Videos fetched'));
}));

// GET /api/learning/catalogue  — full grouped catalogue
router.get('/catalogue', asyncHandler(async (req, res) => {
  const videos = await LearningVideo.find();
  // Group by skill → software → videos[]
  const catalogue = {};
  for (const v of videos) {
    if (!catalogue[v.skill]) catalogue[v.skill] = {};
    if (!catalogue[v.skill][v.software]) catalogue[v.skill][v.software] = [];
    catalogue[v.skill][v.software].push(v);
  }
  res.json(new ApiResponse(200, catalogue, 'Catalogue fetched'));
}));

export default router;
