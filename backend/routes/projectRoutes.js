const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/auth');
const { validateProject } = require('../middleware/validators');

router.post('/', authMiddleware, validateProject, projectController.createProject);
router.get('/', authMiddleware, projectController.getProjects);
router.get('/:id', authMiddleware, projectController.getProjectById);
router.put('/:id', authMiddleware, projectController.updateProject);
router.delete('/:id', authMiddleware, projectController.deleteProject);
router.post('/:id/assign', authMiddleware, projectController.assignUserToProject);

module.exports = router;
