import express from 'express';
import { getMyRewards } from '../controllers/rewardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-rewards', protect, getMyRewards);

export default router;
