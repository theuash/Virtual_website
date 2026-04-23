import express from 'express';
import { getConversations, getMessages, createConversation, getDefaultConversation } from '../controllers/messaging.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/conversations',              getConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations',             createConversation);
router.get('/default-conversation',       getDefaultConversation);

export default router;
