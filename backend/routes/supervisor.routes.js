import express from 'express';
import {
  getSupervisorProjects, getSupervisorProjectDetail, dispatchProject,
  getSupervisorTeams, getPrecrates, getPrecratDetail, updatePrecrate, suspendPrecrate,
  getGroupProjects,
  getSupervisorClients, getPayouts, distributePayroll,
  getSupervisorEarnings, getSupervisorWallet, supervisorWithdraw,
  getSupervisorNotifications,
} from '../controllers/supervisor.controller.js';
import {
  getFreelancerMeetings, createFreelancerMeeting, getMeetingDetail,
  updateMeetingStatus, addParticipant, cancelMeeting,
} from '../controllers/meeting.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = express.Router();
router.use(protect, requireRole('momentum_supervisor'));

router.get('/projects',                          getSupervisorProjects);
router.get('/projects/:id',                      getSupervisorProjectDetail);
router.post('/projects/:id/dispatch',            dispatchProject);
router.get('/teams',                             getSupervisorTeams);
router.get('/precrates',                         getPrecrates);
router.get('/precrates/:id',                     getPrecratDetail);
router.patch('/precrates/:id',                   updatePrecrate);
router.post('/precrates/:id/suspend',            suspendPrecrate);
router.get('/group-projects',                    getGroupProjects);
router.get('/clients',                           getSupervisorClients);
router.get('/payouts',                           getPayouts);
router.post('/payouts/:projectId/distribute',    distributePayroll);
router.get('/earnings',                          getSupervisorEarnings);
router.get('/wallet',                            getSupervisorWallet);
router.post('/wallet/withdraw',                  supervisorWithdraw);
router.get('/notifications',                     getSupervisorNotifications);

// Meeting routes (reuse freelancer meeting controller — role-agnostic)
router.route('/meetings')
  .get(getFreelancerMeetings)
  .post(createFreelancerMeeting);
router.get('/meetings/:id',                      getMeetingDetail);
router.patch('/meetings/:id/status',             updateMeetingStatus);
router.post('/meetings/:id/participants',         addParticipant);
router.post('/meetings/:id/cancel',              cancelMeeting);

export default router;
