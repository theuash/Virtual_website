import express from 'express';
import { getConversations, getMessages, createConversation } from '../controllers/messaging.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All messaging routes require a valid JWT
router.use(protect);

router.get('/conversations',              getConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations',             createConversation);

export default router;
