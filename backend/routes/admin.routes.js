import express from 'express';
import { getAdminDashboardStats, getUsers, toggleUserSuspension } from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(protect, requireRole('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/suspend', toggleUserSuspension);

export default router;
