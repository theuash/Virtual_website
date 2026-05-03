import express from 'express';
import { getConversations, getMessages, createConversation, getDefaultConversation, deleteConversation, blockUser, unblockUser, sendMessage } from '../controllers/messaging.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/conversations',                        getConversations);
router.get('/conversations/:id/messages',           getMessages);
router.post('/conversations/:id/messages',          sendMessage);
router.post('/conversations',                       createConversation);
router.delete('/conversations/:id',                 deleteConversation);
router.post('/conversations/:id/block',             blockUser);
router.post('/conversations/:id/unblock',           unblockUser);
router.get('/default-conversation',                 getDefaultConversation);

export default router;
