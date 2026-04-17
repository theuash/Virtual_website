import express from 'express';
import { getDashboardStats, getAvailableTasks, getTaskDetail, submitDeliverable } from '../controllers/freelancer.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(protect, requireRole('freelancer'));

router.get('/dashboard', getDashboardStats);
router.get('/tasks', getAvailableTasks);
router.get('/tasks/:id', getTaskDetail);
router.post('/tasks/:id/submit', submitDeliverable);

export default router;
