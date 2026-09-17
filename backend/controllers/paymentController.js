import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import RewardTransaction from '../models/RewardTransaction.js';
import PaymentAttempt from '../models/PaymentAttempt.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';
import {
  createCashfreePgOrder,
  fetchCashfreePgOrder,
  fetchCashfreePgOrderPayments,
  verifyCashfreeWebhookSignature,
} from '../config/cashfreeConfig.js';
import {
  getRazorpayClient,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from '../config/razorpayConfig.js';

// Helper to sanitize frontend / backend base URLs
const getBaseUrls = (req) => {
  let frontendUrl = (process.env.FRONTEND_URL || 'https://ourstartup-woad.vercel.app').replace(/\/+$/, '');
  const backendUrl = (process.env.BACKEND_URL || 'https://ourstartup.onrender.com').replace(/\/+$/, '');

  const clientOrigin = req?.headers?.origin || '';
  const clientReferer = req?.headers?.referer || '';
  let reqOrigin = clientOrigin;
  if (!reqOrigin && clientReferer) {
    try {
      reqOrigin = new URL(clientReferer).origin;
    } catch (e) {}
  }

  if (
    reqOrigin &&
    (reqOrigin.includes('localhost') ||
      reqOrigin.includes('127.0.0.1') ||
      reqOrigin.includes('192.168.') ||
      reqOrigin.includes('10.') ||
      reqOrigin.includes('172.'))
  ) {
    frontendUrl = reqOrigin.replace(/\/+$/, '');
  }

  return { frontendUrl, backendUrl };
};

/**
 * =========================================================================
 * CASHFREE PAYMENT GATEWAY INTEGRATION (SANDBOX / TEST MODE)
 * =========================================================================
 */

/**
 * POST /api/payment/cashfree/create-order
 * Initiates a Cashfree hosted checkout order and returns payment_session_id
 */
export const createCashfreeOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to complete payment.',
      });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order identifier (orderId) is required to initiate payment.',
      });
    }

    let order;
    if (isMongoConnected) {
      const orConditions = [{ orderId: orderId }, { cashfreeOrderId: orderId }];
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        orConditions.push({ _id: orderId });
      }
      order = await Order.findOne({ $or: orConditions });
    } else {
      order = mockStore.orders.find((o) => o._id === orderId || o.orderId === orderId);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for payment initiation.',
      });
    }

    // Security Check: Verify that the caller owns the order
    const orderUserId = order.user?._id ? order.user._id.toString() : order.user?.toString();
    const callerUserId = req.user._id?.toString();
    if (orderUserId && callerUserId && orderUserId !== callerUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to pay for this order.',
      });
    }

    // Security Check: Prevent duplicate payment if already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid and confirmed.',
        data: { orderId: order._id, customOrderId: order.orderId, isPaid: true },
      });
    }

    // Security Check: Server-side validation of payable amount (Never trust frontend amount)
    const payableAmount = Number(order.totalPrice);
    if (!payableAmount || payableAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payable amount for order.',
      });
    }

    // Fallback: If Cashfree credentials are not configured, seamlessly route to Razorpay
    const cfAppId = (process.env.CASHFREE_APP_ID || '').trim();
    const cfSecret = (process.env.CASHFREE_SECRET_KEY || '').trim();
    if (!cfAppId || !cfSecret) {
      console.warn('[Payment Gateway] Cashfree credentials are not configured. Routing order initiation to Razorpay.');
      return createRazorpayOrder(req, res);
    }

    const { frontendUrl, backendUrl } = getBaseUrls(req);

    // Unique Cashfree Order ID (alphanumeric, underscore, hyphen, max 50 chars)
    const cleanId = order.orderId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cfUniqueOrderId = `cf_${cleanId}_${Date.now().toString().slice(-6)}`;

    const customerDetails = {
      customer_id: callerUserId || `cust_${order.orderId}`,
      customer_name: req.user.name || order.shippingAddress?.fullName || 'Zivana Patron',
      customer_email: req.user.email || 'patron@zivanajewels.com',
      customer_phone: order.shippingAddress?.phone || req.user.phone || '9876543210',
    };

    // Return URL for frontend callback & Notify URL for webhook
    const returnUrl = `${frontendUrl}/order-success?order_id={order_id}`;
    const notifyUrl = `${backendUrl}/api/payments/cashfree/webhook`;

    console.log(`\n================ CASHFREE ORDER CREATION ================`);
    console.log(`[Cashfree] Initiating Order Creation for: ${cfUniqueOrderId}`);
    console.log(`[Cashfree] Customer: ${customerDetails.customer_name} (${customerDetails.customer_phone})`);
    console.log(`[Cashfree] Payable Amount: ₹${payableAmount} INR`);
    console.log(`[Cashfree] Return URL: ${returnUrl}`);
    console.log(`[Cashfree] Notify URL: ${notifyUrl}`);
    console.log(`[Cashfree] Environment: ${process.env.CASHFREE_ENV || 'sandbox'}`);

    // Call Cashfree PG Sandbox API
    const cfResponse = await createCashfreePgOrder({
      orderId: cfUniqueOrderId,
      orderAmount: payableAmount,
      customerDetails,
      returnUrl,
      notifyUrl,
      orderNote: `Zivana Jewels Heirloom Order ${order.orderId}`,
    });

    console.log(`[Cashfree] Order Created Successfully in Sandbox.`);
    console.log(`[Cashfree] Cashfree Order ID: ${cfResponse.order_id}`);
    console.log(`[Cashfree] payment_session_id present: ${Boolean(cfResponse.payment_session_id)}`);
    console.log(`=========================================================\n`);

    // Save Cashfree order ID & session info to MongoDB
    if (isMongoConnected) {
      order.cashfreeOrderId = cfUniqueOrderId;
      order.paymentMethod = 'cashfree';
      order.paymentResult = {
        cf_order_id: cfUniqueOrderId,
        status: 'SESSION_CREATED',
      };
      await order.save();
    } else {
      order.cashfreeOrderId = cfUniqueOrderId;
      order.paymentMethod = 'cashfree';
      order.paymentResult = {
        cf_order_id: cfUniqueOrderId,
        status: 'SESSION_CREATED',
      };
    }

    return res.json({
      success: true,
      data: {
        payment_session_id: cfResponse.payment_session_id,
        cf_order_id: cfResponse.order_id,
        orderId: order._id,
        customOrderId: order.orderId,
        amount: payableAmount,
        currency: 'INR',
        environment: process.env.CASHFREE_ENV || 'sandbox',
      },
      message: 'Cashfree payment session initialized successfully.',
    });
  } catch (error) {
    console.error('[Cashfree Controller] Create Order Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate Cashfree payment session.',
    });
  }
};

/**
 * Helper: Apply successful payment to MongoDB Order idempotently
 */
const applySuccessfulPayment = async (order, paymentDetails) => {
  if (order.isPaid) {
    return order; // Idempotent: already processed
  }

  const isRazorpay = Boolean(
    paymentDetails.isRazorpay ||
    paymentDetails.razorpay_payment_id ||
    paymentDetails.razorpay_order_id
  );

  order.isPaid = true;
  order.paidAt = new Date(paymentDetails.payment_completion_time || Date.now());
  order.orderStatus = 'Confirmed';
  order.paymentMethod = isRazorpay ? 'razorpay' : (order.paymentMethod || 'cashfree');

  if (isRazorpay) {
    order.razorpayOrderId = paymentDetails.razorpay_order_id || order.razorpayOrderId || '';
    order.paymentResult = {
      id: paymentDetails.razorpay_payment_id || `rzp_pay_${Date.now()}`,
      status: 'SUCCESS',
      razorpay_order_id: paymentDetails.razorpay_order_id || order.razorpayOrderId || '',
      razorpay_payment_id: paymentDetails.razorpay_payment_id,
      razorpay_signature: paymentDetails.razorpay_signature || '',
      payment_method: paymentDetails.payment_method || 'Razorpay Online',
      bank_reference: paymentDetails.bank_reference || '',
      payment_message: paymentDetails.payment_message || 'Payment confirmed via Razorpay.',
      raw_response: paymentDetails.raw_response || paymentDetails,
    };

    order.statusTimeline.push({
      status: 'Confirmed',
      note: `Payment of ₹${order.totalPrice} verified and captured successfully via Razorpay. (Payment ID: ${paymentDetails.razorpay_payment_id || 'N/A'})`,
      timestamp: new Date(),
    });
  } else {
    order.paymentResult = {
      id: paymentDetails.cf_payment_id || `cf_pay_${Date.now()}`,
      status: 'SUCCESS',
      cf_order_id: paymentDetails.order_id || order.cashfreeOrderId,
      cf_payment_id: paymentDetails.cf_payment_id,
      payment_method: paymentDetails.payment_group || 'Cashfree Online',
      bank_reference: paymentDetails.bank_reference || '',
      payment_message: paymentDetails.payment_message || 'Payment confirmed by Cashfree.',
      raw_response: paymentDetails,
    };

    order.statusTimeline.push({
      status: 'Confirmed',
      note: `Payment of ₹${order.totalPrice} verified and captured successfully via Cashfree. (CF Payment ID: ${paymentDetails.cf_payment_id || 'N/A'})`,
      timestamp: new Date(),
    });
  }

  if (isMongoConnected) {
    await order.save();

    // Upsert PaymentAttempt record for audit and admin payments management
    const attemptPaymentId = isRazorpay
      ? (paymentDetails.razorpay_payment_id || `rzp_pay_${Date.now()}`)
      : (paymentDetails.cf_payment_id || `cf_pay_${Date.now()}`);

    try {
      await PaymentAttempt.findOneAndUpdate(
        { paymentId: attemptPaymentId },
        {
          paymentId: attemptPaymentId,
          razorpayOrderId: paymentDetails.razorpay_order_id || order.razorpayOrderId || '',
          gateway: isRazorpay ? 'razorpay' : 'cashfree',
          order: order._id,
          orderId: order.orderId,
          customerName: order.shippingAddress?.fullName || 'Zivana Patron',
          customerEmail: order.shippingAddress?.email || '',
          customerPhone: order.shippingAddress?.phone || '',
          amount: Number(order.totalPrice) || 0,
          currency: 'INR',
          paymentMethod: isRazorpay ? (paymentDetails.payment_method || 'Razorpay Online') : 'Cashfree Online',
          status: 'captured',
          errorCode: '',
          failureReason: '',
          rawResponse: paymentDetails.raw_response || paymentDetails,
        },
        { upsert: true, new: true }
      );
    } catch (paErr) {
      console.warn('[PaymentAttempt] Non-critical: failed to log payment attempt:', paErr.message);
    }

    // Award ocean points if eligible
    if (order.oceanPointsEarned > 0 && order.user && mongoose.Types.ObjectId.isValid(order.user)) {
      const user = await User.findById(order.user);
      if (user) {
        user.oceanPoints += order.oceanPointsEarned;
        await user.save();
        await RewardTransaction.create({
          user: user._id,
          order: order._id,
          points: order.oceanPointsEarned,
          type: 'EARNED',
          description: `Earned ${order.oceanPointsEarned} Ocean Points from verified Order ${order.orderId}`,
          balanceAfter: user.oceanPoints,
        });
      }
    }
  } else {
    const attemptPaymentId = isRazorpay
      ? (paymentDetails.razorpay_payment_id || `rzp_pay_${Date.now()}`)
      : (paymentDetails.cf_payment_id || `cf_pay_${Date.now()}`);
    mockStore.paymentAttempts.push({
      _id: `pa_${Date.now()}`,
      paymentId: attemptPaymentId,
      razorpayOrderId: paymentDetails.razorpay_order_id || order.razorpayOrderId || '',
      gateway: isRazorpay ? 'razorpay' : 'cashfree',
      order: order._id,
      orderId: order.orderId,
      customerName: order.shippingAddress?.fullName || 'Zivana Patron',
      customerEmail: order.shippingAddress?.email || '',
      customerPhone: order.shippingAddress?.phone || '',
      amount: Number(order.totalPrice) || 0,
      currency: 'INR',
      paymentMethod: isRazorpay ? (paymentDetails.payment_method || 'Razorpay Online') : 'Cashfree Online',
      status: 'captured',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (order.oceanPointsEarned > 0 && order.user) {
      const user = mockStore.users.find((u) => u._id?.toString() === order.user?.toString());
      if (user) {
        user.oceanPoints += order.oceanPointsEarned;
        mockStore.rewardTransactions.push({
          _id: `rew_${Date.now()}`,
          user: user._id,
          order: order._id,
          points: order.oceanPointsEarned,
          type: 'EARNED',
          description: `Earned ${order.oceanPointsEarned} Ocean Points from verified Order ${order.orderId}`,
          balanceAfter: user.oceanPoints,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return order;
};

/**
 * POST /api/payment/cashfree/verify
 * or GET /api/payment/cashfree/verify/:orderId
 * Server-side verification of payment status via Cashfree PG API
 */
export const verifyCashfreePayment = async (req, res) => {
  try {
    const rawOrderId = req.body?.order_id || req.body?.orderId || req.params?.orderId;
    if (!rawOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Order identifier is required for verification.',
      });
    }

    // Lookup order by internal _id, custom orderId, or Cashfree cashfreeOrderId
    let order;
    if (isMongoConnected) {
      const orConditions = [
        { cashfreeOrderId: rawOrderId },
        { orderId: rawOrderId },
      ];
      if (mongoose.Types.ObjectId.isValid(rawOrderId)) {
        orConditions.push({ _id: rawOrderId });
      }
      order = await Order.findOne({ $or: orConditions });
    } else {
      order = mockStore.orders.find(
        (o) => o.cashfreeOrderId === rawOrderId || o.orderId === rawOrderId || o._id === rawOrderId
      );
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order record not found in system.',
      });
    }

    // If order is already paid, return early (Idempotency)
    if (order.isPaid) {
      return res.json({
        success: true,
        status: 'SUCCESS',
        message: 'Payment has already been confirmed.',
        data: order,
      });
    }

    // Cashfree order_id to query
    const cfOrderIdToQuery = order.cashfreeOrderId || rawOrderId;

    // Fetch order details and payments from Cashfree
    let cfOrder;
    let cfPayments = [];

    try {
      cfOrder = await fetchCashfreePgOrder(cfOrderIdToQuery);
      cfPayments = await fetchCashfreePgOrderPayments(cfOrderIdToQuery);
    } catch (cfErr) {
      console.error('[Cashfree Verification] Cashfree PG fetch error:', cfErr.message);
      return res.status(502).json({
        success: false,
        status: 'PENDING',
        message: 'Unable to communicate with Cashfree. Please retry verification shortly.',
        error: cfErr.message,
      });
    }

    console.log(`\n================ CASHFREE PAYMENT VERIFICATION ================`);
    console.log(`[Cashfree Verify] Querying Cashfree API for Order ID: ${cfOrderIdToQuery}`);
    console.log(`[Cashfree Verify] Cashfree Order Status: ${cfOrder?.order_status} | Payments Recorded: ${cfPayments?.length || 0}`);

    if (Array.isArray(cfPayments) && cfPayments.length > 0) {
      cfPayments.forEach((p, idx) => {
        console.log(`[Cashfree Verify] Payment #${idx + 1}: ID: ${p.cf_payment_id} | Status: ${p.payment_status} | Method: ${p.payment_group || 'N/A'}`);
      });
    }

    // Check if any payment attempt was successful
    const successfulPayment = Array.isArray(cfPayments)
      ? cfPayments.find((p) => p.payment_status === 'SUCCESS')
      : null;

    const isOrderPaid = cfOrder?.order_status === 'PAID' || Boolean(successfulPayment);

    if (isOrderPaid) {
      const paymentInfo = successfulPayment || {
        cf_payment_id: cfOrder.cf_order_id,
        order_id: cfOrder.order_id,
        payment_status: 'SUCCESS',
        payment_completion_time: new Date().toISOString(),
      };

      console.log(`[Cashfree Verify] Result: SUCCESS (PAID). Updating MongoDB Order ${order.orderId}`);
      console.log(`================================================================\n`);
      const updatedOrder = await applySuccessfulPayment(order, paymentInfo);
      return res.json({
        success: true,
        status: 'SUCCESS',
        message: 'Payment verified and confirmed successfully!',
        data: updatedOrder,
      });
    }

    // Check if there are failed payment attempts
    const failedPayment = Array.isArray(cfPayments)
      ? cfPayments.find((p) => ['FAILED', 'USER_DROPPED', 'CANCELLED'].includes(p.payment_status))
      : null;

    if (failedPayment) {
      console.log(`[Cashfree Verify] Result: FAILED / DROPPED (${failedPayment.payment_status})`);
      console.log(`================================================================\n`);
      if (isMongoConnected) {
        order.paymentResult = {
          status: failedPayment.payment_status,
          cf_order_id: cfOrderIdToQuery,
          cf_payment_id: failedPayment.cf_payment_id,
          payment_message: failedPayment.payment_message || 'Payment failed or cancelled.',
          raw_response: failedPayment,
        };
        await order.save();
      }
      return res.json({
        success: false,
        status: failedPayment.payment_status,
        message: failedPayment.payment_message || 'Payment was not completed.',
        data: order,
      });
    }

    // Still pending / active
    console.log(`[Cashfree Verify] Result: PENDING (Order is active, awaiting bank clearance)`);
    console.log(`================================================================\n`);
    return res.json({
      success: false,
      status: 'PENDING',
      message: 'Payment status is currently pending or processing.',
      data: order,
    });
  } catch (error) {
    console.error('[Cashfree Verification Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed.',
    });
  }
};

/**
 * POST /api/payment/cashfree/webhook
 * Handles asynchronous Cashfree Webhook notifications with signature verification
 */
export const cashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    // Cryptographic signature check
    const isValid = verifyCashfreeWebhookSignature(signature, rawBody, timestamp);
    if (!isValid) {
      console.warn('[Cashfree Webhook] Security Alert: Invalid webhook signature received.');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature.',
      });
    }

    const payload = req.body || {};
    const eventType = payload.type || payload.event || '';
    const eventData = payload.data || {};

    const cfOrderId = eventData.order?.order_id || eventData.payment?.order_id || payload.orderId;
    const paymentStatus = eventData.payment?.payment_status;

    if (!cfOrderId) {
      return res.status(200).json({ status: 'ignored', reason: 'Missing order_id in webhook payload' });
    }

    let order;
    if (isMongoConnected) {
      const orConditions = [
        { cashfreeOrderId: cfOrderId },
        { orderId: cfOrderId },
      ];
      if (mongoose.Types.ObjectId.isValid(cfOrderId)) {
        orConditions.push({ _id: cfOrderId });
      }
      order = await Order.findOne({ $or: orConditions });
    } else {
      order = mockStore.orders.find(
        (o) => o.cashfreeOrderId === cfOrderId || o.orderId === cfOrderId || o._id === cfOrderId
      );
    }

    if (!order) {
      console.warn(`[Cashfree Webhook] Order ${cfOrderId} not found in database.`);
      return res.status(200).json({ status: 'ignored', reason: 'Order not found' });
    }

    // Idempotent: If already marked paid, return 200 immediately
    if (order.isPaid) {
      return res.status(200).json({ status: 'already_processed' });
    }

    // Process payment success events
    const isSuccess =
      eventType === 'PAYMENT_SUCCESS_WEBHOOK' ||
      eventType === 'ORDER_PAID' ||
      paymentStatus === 'SUCCESS';

    if (isSuccess) {
      const paymentDetails = {
        cf_payment_id: eventData.payment?.cf_payment_id || `cf_wh_${Date.now()}`,
        order_id: cfOrderId,
        payment_completion_time: eventData.payment?.payment_completion_time || new Date().toISOString(),
        payment_group: eventData.payment?.payment_group || 'Cashfree Online',
        bank_reference: eventData.payment?.bank_reference || '',
        payment_message: eventData.payment?.payment_message || 'Payment confirmed via webhook.',
      };

      await applySuccessfulPayment(order, paymentDetails);
      console.log(`[Cashfree Webhook] Order ${order.orderId} marked as PAID via webhook confirmation.`);
      return res.status(200).json({ status: 'success', message: 'Order marked as paid' });
    }

    // Handle payment failures
    if (['PAYMENT_FAILED_WEBHOOK', 'PAYMENT_USER_DROPPED_WEBHOOK'].includes(eventType) || paymentStatus === 'FAILED') {
      if (isMongoConnected) {
        order.paymentResult = {
          status: 'FAILED',
          cf_order_id: cfOrderId,
          cf_payment_id: eventData.payment?.cf_payment_id,
          payment_message: eventData.payment?.payment_message || 'Payment failed via webhook notification.',
          raw_response: eventData,
        };
        await order.save();
      }
      return res.status(200).json({ status: 'recorded_failure' });
    }

    return res.status(200).json({ status: 'unhandled_event_type', type: eventType });
  } catch (error) {
    console.error('[Cashfree Webhook Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal error processing webhook.',
    });
  }
};

/**
 * =========================================================================
 * RAZORPAY LIVE PAYMENT GATEWAY INTEGRATION
 * =========================================================================
 */

/**
 * POST /api/payment/razorpay/create-order
 * Validates order server-side, calculates exact amount in paise (INR),
 * and creates an official Razorpay Order via Node SDK.
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to complete payment.',
      });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order identifier (orderId) is required.',
      });
    }

    let order;
    if (isMongoConnected) {
      const orConditions = [{ orderId: orderId }, { razorpayOrderId: orderId }];
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        orConditions.push({ _id: orderId });
      }
      order = await Order.findOne({ $or: orConditions });
    } else {
      order = mockStore.orders.find(
        (o) => o._id === orderId || o.orderId === orderId || o.razorpayOrderId === orderId
      );
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for payment initiation.',
      });
    }

    // Security Check: Verify that caller owns the order
    const orderUserId = order.user?._id ? order.user._id.toString() : order.user?.toString();
    const callerUserId = req.user._id?.toString();
    if (orderUserId && callerUserId && orderUserId !== callerUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to pay for this order.',
      });
    }

    // Security Check: Prevent duplicate payment if already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid and confirmed.',
        data: { orderId: order._id, customOrderId: order.orderId, isPaid: true },
      });
    }

    // Security Check: Server-side validation of payable amount (Never trust frontend)
    const payableAmount = Number(order.totalPrice);
    if (!payableAmount || payableAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payable amount for order.',
      });
    }

    const amountInPaise = Math.round(payableAmount * 100);
    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();

    // Initialize Razorpay SDK instance
    const razorpay = getRazorpayClient();

    // Create Razorpay Order
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderId.slice(0, 40),
      notes: {
        internalOrderId: order._id.toString(),
        customOrderId: order.orderId,
        userPhone: order.shippingAddress?.phone || req.user?.phone || '',
      },
    });

    // Store razorpayOrderId on the order in MongoDB
    order.razorpayOrderId = rzpOrder.id;
    order.paymentMethod = 'razorpay';
    if (isMongoConnected) {
      await order.save();
    }

    console.log(`[Razorpay] Created Order ${rzpOrder.id} for Order ${order.orderId} (₹${payableAmount} INR)`);

    return res.status(200).json({
      success: true,
      data: {
        keyId,
        orderId: order._id,
        customOrderId: order.orderId,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        prefill: {
          name: order.shippingAddress?.fullName || req.user?.name || '',
          email: req.user?.email || '',
          contact: order.shippingAddress?.phone || req.user?.phone || '',
        },
      },
    });
  } catch (error) {
    console.error('[Razorpay Order Creation Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate Razorpay order.',
    });
  }
};

/**
 * POST /api/payment/razorpay/verify
 * Verifies Razorpay payment signature using HMAC-SHA256 with RAZORPAY_KEY_SECRET
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification details.',
      });
    }

    // Lookup order by razorpay_order_id, internal _id, or custom orderId
    let order;
    if (isMongoConnected) {
      const orConditions = [{ razorpayOrderId: razorpay_order_id }];
      if (orderId) {
        orConditions.push({ orderId: orderId });
        if (mongoose.Types.ObjectId.isValid(orderId)) {
          orConditions.push({ _id: orderId });
        }
      }
      order = await Order.findOne({ $or: orConditions });
    } else {
      order = mockStore.orders.find(
        (o) =>
          o.razorpayOrderId === razorpay_order_id ||
          o._id === orderId ||
          o.orderId === orderId
      );
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order record not found for verification.',
      });
    }

    // Idempotency: If order was already confirmed (e.g. by Webhook), return success immediately
    if (order.isPaid) {
      return res.json({
        success: true,
        status: 'SUCCESS',
        message: 'Payment has already been confirmed.',
        data: order,
      });
    }

    // Verify HMAC-SHA256 signature
    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      console.warn(`[Razorpay Signature Verification FAILED] Order: ${order.orderId}, Payment ID: ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        message: 'Payment verification failed: Signature mismatch.',
      });
    }

    // Fetch payment details from Razorpay to extract payment method & bank reference
    let paymentMethodName = 'Razorpay Online';
    let bankRef = '';
    try {
      const razorpay = getRazorpayClient();
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      if (paymentDetails) {
        paymentMethodName = paymentDetails.method
          ? `Razorpay ${paymentDetails.method.toUpperCase()}`
          : 'Razorpay Online';
        bankRef =
          paymentDetails.acquirer_data?.bank_transaction_id ||
          paymentDetails.acquirer_data?.rrn ||
          paymentDetails.acquirer_data?.upi_transaction_id ||
          '';
      }
    } catch (fetchErr) {
      console.warn('[Razorpay] Non-critical: could not fetch payment details from Razorpay API:', fetchErr.message);
    }

    const updatedOrder = await applySuccessfulPayment(order, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_method: paymentMethodName,
      bank_reference: bankRef,
      payment_message: 'Payment verified and captured via Razorpay checkout signature.',
      isRazorpay: true,
    });

    console.log(`[Razorpay Verify] Order ${order.orderId} verified and marked as PAID.`);

    return res.json({
      success: true,
      status: 'SUCCESS',
      message: 'Payment verified and confirmed successfully!',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('[Razorpay Verify Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment verification processing error.',
    });
  }
};

/**
 * POST /api/payment/razorpay/webhook
 * Secure webhook notification endpoint from Razorpay
 * Uses RAW request body and RAZORPAY_WEBHOOK_SECRET for signature verification
 */
export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    if (!signature) {
      console.warn('[Razorpay Webhook] Missing x-razorpay-signature header.');
      return res.status(400).json({ success: false, message: 'Missing signature header' });
    }

    // Validate webhook signature against raw request body
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[Razorpay Webhook] Invalid webhook signature verification failed.');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const payload = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);
    const eventType = payload.event;
    console.log(`[Razorpay Webhook] Received verified event: ${eventType}`);

    // Handle payment.captured or order.paid
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
      const rzpPaymentId = paymentEntity?.id || `rzp_pay_${Date.now()}`;
      const customOrderId =
        paymentEntity?.notes?.customOrderId ||
        orderEntity?.notes?.customOrderId ||
        paymentEntity?.notes?.orderId ||
        orderEntity?.receipt;
      const internalOrderId =
        paymentEntity?.notes?.internalOrderId || orderEntity?.notes?.internalOrderId;

      let order;
      if (isMongoConnected) {
        const orConditions = [];
        if (rzpOrderId) orConditions.push({ razorpayOrderId: rzpOrderId });
        if (customOrderId) orConditions.push({ orderId: customOrderId });
        if (internalOrderId && mongoose.Types.ObjectId.isValid(internalOrderId)) {
          orConditions.push({ _id: internalOrderId });
        }

        if (orConditions.length > 0) {
          order = await Order.findOne({ $or: orConditions });
        }
      } else {
        order = mockStore.orders.find(
          (o) =>
            (rzpOrderId && o.razorpayOrderId === rzpOrderId) ||
            (customOrderId && o.orderId === customOrderId)
        );
      }

      if (!order) {
        console.warn(`[Razorpay Webhook] No matching order found for rzpOrderId: ${rzpOrderId}, receipt: ${customOrderId}`);
        return res.status(200).json({ status: 'ignored', reason: 'Order not found' });
      }

      // Idempotency: If already marked paid, return 200 immediately
      if (order.isPaid) {
        console.log(`[Razorpay Webhook] Order ${order.orderId} already marked as paid. Ignoring duplicate webhook.`);
        return res.status(200).json({ status: 'already_processed' });
      }

      const paymentDetails = {
        razorpay_order_id: rzpOrderId || order.razorpayOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: signature,
        payment_method: paymentEntity?.method
          ? `Razorpay ${paymentEntity.method.toUpperCase()}`
          : 'Razorpay Online',
        bank_reference:
          paymentEntity?.acquirer_data?.bank_transaction_id ||
          paymentEntity?.acquirer_data?.rrn ||
          paymentEntity?.acquirer_data?.upi_transaction_id ||
          '',
        payment_message: 'Payment confirmed via Razorpay webhook notification.',
        isRazorpay: true,
        raw_response: payload,
      };

      await applySuccessfulPayment(order, paymentDetails);
      console.log(`[Razorpay Webhook] Order ${order.orderId} marked as PAID via webhook confirmation.`);
      return res.status(200).json({ status: 'success', message: 'Order marked as paid' });
    }

    // Handle payment.failed
    if (eventType === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const customOrderId = paymentEntity?.notes?.customOrderId || paymentEntity?.notes?.orderId;

      let order;
      if (isMongoConnected) {
        const orConditions = [];
        if (rzpOrderId) orConditions.push({ razorpayOrderId: rzpOrderId });
        if (customOrderId) orConditions.push({ orderId: customOrderId });
        if (orConditions.length > 0) {
          order = await Order.findOne({ $or: orConditions });
        }
      }

      if (order && !order.isPaid) {
        order.paymentResult = {
          status: 'FAILED',
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: paymentEntity?.id,
          payment_message: paymentEntity?.error_description || 'Payment failed via Razorpay.',
          raw_response: payload,
        };
        await order.save();
        console.log(`[Razorpay Webhook] Recorded payment failure for Order ${order.orderId}`);
      }

      // Upsert failed PaymentAttempt record for audit and admin diagnostics
      const failedPaymentId = paymentEntity?.id || `rzp_fail_${Date.now()}`;
      const failReason = paymentEntity?.error_description || paymentEntity?.error_reason || 'Payment failed via Razorpay.';
      const failCode = paymentEntity?.error_code || paymentEntity?.error_source || '';
      const failAmount = paymentEntity?.amount ? Number(paymentEntity.amount) / 100 : (order?.totalPrice || 0);

      try {
        if (isMongoConnected) {
          await PaymentAttempt.findOneAndUpdate(
            { paymentId: failedPaymentId },
            {
              paymentId: failedPaymentId,
              razorpayOrderId: rzpOrderId || order?.razorpayOrderId || '',
              gateway: 'razorpay',
              order: order?._id,
              orderId: order?.orderId || customOrderId || 'N/A',
              customerName: order?.shippingAddress?.fullName || paymentEntity?.notes?.customerName || paymentEntity?.email || 'Zivana Patron',
              customerEmail: paymentEntity?.email || order?.shippingAddress?.email || '',
              customerPhone: paymentEntity?.contact || order?.shippingAddress?.phone || '',
              amount: failAmount,
              currency: paymentEntity?.currency || 'INR',
              paymentMethod: paymentEntity?.method ? `Razorpay ${paymentEntity.method.toUpperCase()}` : 'Razorpay Online',
              status: 'failed',
              errorCode: failCode,
              failureReason: failReason,
              rawResponse: payload,
            },
            { upsert: true, new: true }
          );
        } else {
          mockStore.paymentAttempts.push({
            _id: `pa_${Date.now()}`,
            paymentId: failedPaymentId,
            razorpayOrderId: rzpOrderId || order?.razorpayOrderId || '',
            gateway: 'razorpay',
            order: order?._id,
            orderId: order?.orderId || customOrderId || 'N/A',
            customerName: order?.shippingAddress?.fullName || 'Zivana Patron',
            customerEmail: paymentEntity?.email || '',
            customerPhone: paymentEntity?.contact || '',
            amount: failAmount,
            currency: paymentEntity?.currency || 'INR',
            paymentMethod: paymentEntity?.method ? `Razorpay ${paymentEntity.method.toUpperCase()}` : 'Razorpay Online',
            status: 'failed',
            errorCode: failCode,
            failureReason: failReason,
            rawResponse: payload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (logErr) {
        console.warn('[PaymentAttempt] Failed to log failed attempt:', logErr.message);
      }

      return res.status(200).json({ status: 'recorded_failure' });
    }

    return res.status(200).json({ status: 'unhandled_event', type: eventType });
  } catch (error) {
    console.error('[Razorpay Webhook Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal error processing Razorpay webhook.',
    });
  }
};

/**
 * POST /api/payment/record-attempt
 * Records real-time payment attempt failures/dismissals from checkout modal
 */
export const recordPaymentAttempt = async (req, res) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      paymentId,
      status,
      errorCode,
      failureReason,
      paymentMethod,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    let order;
    if (isMongoConnected) {
      const orConditions = [{ orderId }];
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        orConditions.push({ _id: orderId });
      }
      if (razorpayOrderId) {
        orConditions.push({ razorpayOrderId });
      }
      order = await Order.findOne({ $or: orConditions });
    } else {
      order = mockStore.orders.find(
        (o) =>
          o.orderId === orderId ||
          o._id === orderId ||
          (razorpayOrderId && o.razorpayOrderId === razorpayOrderId)
      );
    }

    const effectivePaymentId = paymentId || `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const attemptData = {
      paymentId: effectivePaymentId,
      razorpayOrderId: razorpayOrderId || order?.razorpayOrderId || '',
      gateway: 'razorpay',
      order: order?._id,
      orderId: order?.orderId || orderId,
      customerName: order?.shippingAddress?.fullName || req.user?.name || 'Zivana Patron',
      customerEmail: req.user?.email || order?.shippingAddress?.email || '',
      customerPhone: order?.shippingAddress?.phone || req.user?.phone || '',
      amount: order?.totalPrice || 0,
      currency: 'INR',
      paymentMethod: paymentMethod || 'Razorpay Online',
      status: status || 'failed',
      errorCode: errorCode || '',
      failureReason: failureReason || 'Customer cancelled or payment declined at checkout.',
      rawResponse: req.body,
    };

    if (isMongoConnected) {
      await PaymentAttempt.findOneAndUpdate(
        { paymentId: effectivePaymentId },
        attemptData,
        { upsert: true, new: true }
      );

      // If order is not paid, update paymentResult on order without changing orderStatus to confirmed
      if (order && !order.isPaid) {
        order.paymentResult = {
          status: 'FAILED',
          razorpay_order_id: razorpayOrderId || order.razorpayOrderId,
          razorpay_payment_id: paymentId,
          payment_message: failureReason || 'Payment failed/abandoned by patron.',
          raw_response: req.body,
        };
        await order.save();
      }
    } else {
      mockStore.paymentAttempts.push({
        _id: `pa_${Date.now()}`,
        ...attemptData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      if (order && !order.isPaid) {
        order.paymentResult = {
          status: 'FAILED',
          razorpay_order_id: razorpayOrderId || order.razorpayOrderId,
          razorpay_payment_id: paymentId,
          payment_message: failureReason || 'Payment failed/abandoned by patron.',
          raw_response: req.body,
        };
      }
    }

    return res.status(200).json({ success: true, message: 'Payment attempt recorded' });
  } catch (err) {
    console.error('[Record Payment Attempt Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use verifyRazorpayPayment instead
 */
export const verifyPayment = verifyRazorpayPayment;
