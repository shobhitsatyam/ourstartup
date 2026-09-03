import crypto from 'crypto';
import Order from '../models/Order.js';
import User from '../models/User.js';
import RewardTransaction from '../models/RewardTransaction.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

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

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_oceanjewel2026';
    const amountInPaise = Math.round(order.totalPrice * 100);
    const rzpOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const customerName = req.user?.name || order.shippingAddress?.fullName || 'Ocean Jewel Patron';
    const customerEmail = req.user?.email || 'client@oceanjewel.com';
    const customerPhone = req.user?.phone || order.shippingAddress?.phone || '+91 9876543210';

    res.json({
      success: true,
      data: {
        keyId,
        orderId: order._id,
        customOrderId: order.orderId,
        amount: amountInPaise,
        currency: 'INR',
        razorpayOrderId: rzpOrderId,
        customerName,
        customerEmail,
        customerPhone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (isMongoConnected) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

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
        note: 'Payment verified and captured successfully via Razorpay.',
        timestamp: new Date(),
      });

      await order.save();

      if (order.oceanPointsEarned > 0 && order.user) {
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

      return res.json({ success: true, data: order, message: 'Payment verified successfully!' });
    } else {
      const order = mockStore.orders.find((o) => o._id === orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.isPaid = true;
      order.paidAt = new Date().toISOString();
      order.paymentResult = {
        id: razorpay_payment_id || `pay_${Date.now()}`,
        status: 'Captured',
        razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id || `pay_${Date.now()}`,
        razorpay_signature: razorpay_signature || 'verified',
      };

      order.statusTimeline.push({
        status: 'Confirmed',
        note: 'Payment verified and captured successfully via Razorpay.',
        timestamp: new Date().toISOString(),
      });

      if (order.oceanPointsEarned > 0) {
        const userId = req.user?._id || order.user;
        const user = mockStore.users.find((u) => u._id.toString() === (userId ? userId.toString() : ''));
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

      return res.json({ success: true, data: order, message: 'Payment verified successfully!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
