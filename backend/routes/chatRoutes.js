import express from 'express';
import { handleChatQuery } from '../controllers/chatController.js';

const router = express.Router();

// Public endpoint for customer AI concierge
router.post('/', handleChatQuery);

export default router;
