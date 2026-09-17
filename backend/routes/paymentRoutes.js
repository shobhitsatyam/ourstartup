import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
  recordPaymentAttempt,
  createCashfreeOrder,
  verifyCashfreePayment,
  cashfreeWebhook,
  verifyPayment,
} from '../controllers/paymentController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Razorpay Payment Gateway Routes (Production Online Gateway)
 */
// 1. Create Razorpay order (server-side validation & calculation in paise)
router.post('/razorpay/create-order', protect, createRazorpayOrder);

// 2. Verify payment status from Razorpay (HMAC-SHA256 signature verification)
router.post('/razorpay/verify', optionalProtect, verifyRazorpayPayment);

// 3. Webhook notification endpoint from Razorpay (RAW body HMAC-SHA256 signature verification)
router.post('/razorpay/webhook', razorpayWebhook);

// 4. Real-time client-side payment attempt diagnostics endpoint
router.post('/record-attempt', optionalProtect, recordPaymentAttempt);

/**
 * Legacy & Cashfree Payment Gateway Routes (Retained for backwards compatibility)
 */
router.post('/cashfree/create-order', protect, createCashfreeOrder);
router.post('/cashfree/verify', optionalProtect, verifyCashfreePayment);
router.get('/cashfree/verify/:orderId', optionalProtect, verifyCashfreePayment);
router.post('/cashfree/webhook', cashfreeWebhook);

// Legacy routes
router.post('/razorpay-order', protect, createRazorpayOrder);
router.post('/verify', optionalProtect, verifyRazorpayPayment);

export default router;
