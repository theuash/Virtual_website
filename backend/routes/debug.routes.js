import express from 'express';
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ success: true, message: 'Server is running.' });
});

export default router;
