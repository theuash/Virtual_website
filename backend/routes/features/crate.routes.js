import express from 'express';
import {
  getCrateProjects, getCrateProjectDetail,
  getMyTeam, getCrateFreelancers, messageFreelancer,
  getCrateWallet, requestWithdrawal, getAnnouncements,
} from '../../controllers/features/crate.controller.js';
import { protect } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roleGuard.js';

const router = express.Router();

// All crate routes require auth + freelancer role + crate (or above) tier
router.use(protect, requireRole('freelancer'));

router.get('/projects',              getCrateProjects);
router.get('/projects/:id',          getCrateProjectDetail);
router.get('/team',                  getMyTeam);
router.get('/freelancers',           getCrateFreelancers);
router.post('/freelancers/:id/message', messageFreelancer);
router.get('/wallet',                getCrateWallet);
router.post('/wallet/withdraw',      requestWithdrawal);
router.get('/announcements',         getAnnouncements);

export default router;
