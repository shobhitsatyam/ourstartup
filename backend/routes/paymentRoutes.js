import express from 'express';
import {
  createCashfreeOrder,
  verifyCashfreePayment,
  cashfreeWebhook,
  createRazorpayOrder,
  verifyPayment,
} from '../controllers/paymentController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Cashfree Payment Gateway Routes (Active Online Payment Gateway)
 */
// 1. Create Cashfree hosted order and return payment_session_id
router.post('/cashfree/create-order', protect, createCashfreeOrder);

// 2. Verify payment status from Cashfree (idempotent, supports both POST and GET, authenticated or guest callback)
router.post('/cashfree/verify', optionalProtect, verifyCashfreePayment);
router.get('/cashfree/verify/:orderId', optionalProtect, verifyCashfreePayment);

// 3. Webhook notification endpoint from Cashfree (public, verified with HMAC-SHA256 signature)
router.post('/cashfree/webhook', cashfreeWebhook);

/**
 * Legacy Razorpay Routes (Deprecated, retained for backwards compatibility)
 */
router.post('/razorpay-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

export default router;
