const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/auth');
const { validateTask } = require('../middleware/validators');

router.post('/', authMiddleware, validateTask, taskController.createTask);
router.get('/', authMiddleware, taskController.getTasks);
router.get('/:id', authMiddleware, taskController.getTaskById);
router.put('/:id', authMiddleware, taskController.updateTask);
router.delete('/:id', authMiddleware, taskController.deleteTask);
router.put('/:id/status', authMiddleware, taskController.updateTaskStatus);
router.post('/:id/comment', authMiddleware, taskController.addComment);

module.exports = router;
