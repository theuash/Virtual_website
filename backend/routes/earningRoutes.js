const express = require('express');
const router = express.Router();
const earningController = require('../controllers/earningController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, earningController.getEarnings);
router.get('/stats', authMiddleware, earningController.getEarningStats);
router.get('/:id', authMiddleware, earningController.getEarningById);
router.post('/', authMiddleware, earningController.createEarning);
router.post('/payout/request', authMiddleware, earningController.requestPayout);

module.exports = router;
