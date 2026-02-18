const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, teamController.createTeam);
router.get('/', authMiddleware, teamController.getTeams);
router.get('/:id', authMiddleware, teamController.getTeamById);
router.put('/:id', authMiddleware, teamController.updateTeam);
router.delete('/:id', authMiddleware, teamController.deleteTeam);
router.post('/:id/members', authMiddleware, teamController.addMember);
router.delete('/:id/members', authMiddleware, teamController.removeMember);

module.exports = router;
