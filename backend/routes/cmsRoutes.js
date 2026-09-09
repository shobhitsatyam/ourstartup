import express from 'express';
import {
  getAllCms,
  getCmsByKey,
  updateCmsByKey,
  resetCmsByKey,
} from '../controllers/cmsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public routes for storefront
router.get('/', getAllCms);
router.get('/:key', getCmsByKey);

// Admin-protected routes
router.put('/:key', protect, adminOnly, updateCmsByKey);
router.delete('/:key', protect, adminOnly, resetCmsByKey);

export default router;
