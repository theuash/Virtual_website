import express from 'express';
import {
  getDashboardStats, createProject, getProjects, getProjectDetail, approveProject,
  getWallet, addMoneyToWallet, payDeposit, payFinal,
} from '../controllers/client.controller.js';
import {
  getClientMeetings, createClientMeeting, getMeetingDetail,
  updateMeetingStatus, addParticipant, cancelMeeting,
} from '../controllers/meeting.controller.js';
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

// Meeting routes
router.route('/meetings')
  .get(getClientMeetings)
  .post(createClientMeeting);
router.route('/meetings/:id')
  .get(getMeetingDetail);
router.patch('/meetings/:id/status', updateMeetingStatus);
router.post('/meetings/:id/participants', addParticipant);
router.post('/meetings/:id/cancel', cancelMeeting);

export default router;
