import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
} from '../controllers/paymentController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/razorpay-order', optionalProtect, createRazorpayOrder);
router.post('/verify', optionalProtect, verifyPayment);

export default router;
