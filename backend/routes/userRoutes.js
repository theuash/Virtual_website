const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/profile', authMiddleware, userController.getUserProfile);
router.get('/:id', authMiddleware, userController.getUser);
router.put('/:id', authMiddleware, userController.updateUser);
router.get('/', authMiddleware, userController.getAllUsers);
router.post('/promote', authMiddleware, roleMiddleware('admin'), userController.promoteUser);

module.exports = router;
