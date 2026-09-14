import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import RewardTransaction from '../models/RewardTransaction.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';
import {
  createCashfreePgOrder,
  fetchCashfreePgOrder,
  fetchCashfreePgOrderPayments,
  verifyCashfreeWebhookSignature,
} from '../config/cashfreeConfig.js';

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

  order.isPaid = true;
  order.paidAt = new Date(paymentDetails.payment_completion_time || Date.now());
  order.orderStatus = 'Confirmed';
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

  if (isMongoConnected) {
    await order.save();

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
 * LEGACY PAYMENT ENDPOINTS (RETAINED FOR BACKWARD COMPATIBILITY)
 * =========================================================================
 */

/**
 * @deprecated Use createCashfreeOrder instead. Retained for backward compatibility.
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    let order;

    if (isMongoConnected) {
      order = await Order.findById(orderId);
    } else {
      order = mockStore.orders.find((o) => o._id === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_legacy';
    const amountInPaise = Math.round(order.totalPrice * 100);
    const rzpOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    res.json({
      success: true,
      data: {
        keyId,
        orderId: order._id,
        customOrderId: order.orderId,
        amount: amountInPaise,
        currency: 'INR',
        razorpayOrderId: rzpOrderId,
        deprecated: true,
        notice: 'Razorpay flow is deprecated. Use Cashfree online payment.',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @deprecated Use verifyCashfreePayment instead. Retained for backward compatibility.
 */
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    let order;
    if (isMongoConnected) {
      order = await Order.findById(orderId);
    } else {
      order = mockStore.orders.find((o) => o._id === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: razorpay_payment_id || `pay_${Date.now()}`,
      status: 'Captured',
      razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id || `pay_${Date.now()}`,
      razorpay_signature: razorpay_signature || 'verified',
    };

    order.statusTimeline.push({
      status: 'Confirmed',
      note: 'Payment verified and captured successfully (Legacy Gateway).',
      timestamp: new Date(),
    });

    if (isMongoConnected) {
      await order.save();
    }

    return res.json({ success: true, data: order, message: 'Payment verified successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
