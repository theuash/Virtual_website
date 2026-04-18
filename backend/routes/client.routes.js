import express from 'express';
import {
  getDashboardStats, createProject, getProjects, getProjectDetail, approveProject,
  getWallet, addMoneyToWallet, payDeposit, payFinal,
} from '../controllers/client.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = express.Router();
router.use(protect, requireRole('client'));

router.get('/dashboard', getDashboardStats);

router.route('/projects')
  .get(getProjects)
  .post(createProject);
router.route('/projects/:id')
  .get(getProjectDetail);
router.patch('/projects/:id/approve',       approveProject);
router.post('/projects/:id/pay-deposit',    payDeposit);
router.post('/projects/:id/pay-final',      payFinal);

router.get('/wallet',      getWallet);
router.post('/wallet/add', addMoneyToWallet);

export default router;
