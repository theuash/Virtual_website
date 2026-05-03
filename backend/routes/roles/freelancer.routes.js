import express from 'express';
import {
  getDashboardStats, getAvailableTasks, getTaskDetail,
  submitDeliverable, completeOnboarding, getSupervisor,
  getLearningProgress, reportWatchProgress,
  getPromotionStatus, applyForPromotion,
} from '../../controllers/roles/freelancer.controller.js';
import {
  getFreelancerMeetings, createFreelancerMeeting, getMeetingDetail,
  updateMeetingStatus, addParticipant, cancelMeeting,
} from '../../controllers/features/meeting.controller.js';
import { protect } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roleGuard.js';

const router = express.Router();

router.use(protect, requireRole('freelancer'));

router.get('/dashboard', getDashboardStats);
router.get('/supervisor', getSupervisor);
router.post('/onboarding', completeOnboarding);
router.get('/learning/progress', getLearningProgress);
router.post('/learning/progress', reportWatchProgress);
router.get('/learning/promotion-status', getPromotionStatus);
router.post('/learning/apply-promotion', applyForPromotion);
router.get('/tasks', getAvailableTasks);
router.get('/tasks/:id', getTaskDetail);
router.post('/tasks/:id/submit', submitDeliverable);

// Meeting routes
router.route('/meetings')
  .get(getFreelancerMeetings)
  .post(createFreelancerMeeting);
router.route('/meetings/:id')
  .get(getMeetingDetail);
router.patch('/meetings/:id/status', updateMeetingStatus);
router.post('/meetings/:id/participants', addParticipant);
router.post('/meetings/:id/cancel', cancelMeeting);

export default router;
