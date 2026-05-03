import express from 'express';
import {
  getTeamProjects, getGroupProjects, getPersonalProjects,
  getMyClients, getOpenProjects, acceptOpenProject,
  getWorkFeed, getInitiatorDashboard,
} from '../../controllers/roles/initiator.controller.js';
import { protect } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roleGuard.js';

const router = express.Router();
router.use(protect, requireRole('freelancer'));

router.get('/dashboard',                    getInitiatorDashboard);
router.get('/projects/team',                getTeamProjects);
router.get('/projects/group',               getGroupProjects);
router.get('/projects/personal',            getPersonalProjects);
router.get('/clients',                      getMyClients);
router.get('/open-projects',                getOpenProjects);
router.post('/open-projects/:id/accept',    acceptOpenProject);
router.get('/work',                         getWorkFeed);

export default router;
