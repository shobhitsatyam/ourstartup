import Order from '../models/Order.js';
import User from '../models/User.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

/**
 * Checks if a customer has any completed or active orders.
 * Orders with status 'Cancelled' or 'Refunded' do NOT count.
 * Uniqueness check considers:
 * - userId (authenticated user ID)
 * - email (User email or shippingAddress email)
 * - phone (User phone or shippingAddress phone, normalized to last 10 digits)
 *
 * Returns true if at least one active/completed order is found, false otherwise.
 */
export const checkCustomerHasCompletedOrders = async ({ userId, email, phone }) => {
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';

  if (!userId && !normalizedEmail && !cleanPhone) {
    return false;
  }

  const excludedStatuses = ['Cancelled', 'Refunded'];

  if (isMongoConnected) {
    const userIdsToCheck = [];
    if (userId) {
      userIdsToCheck.push(userId);
    }

    // If email is provided, find user IDs registered with that email
    if (normalizedEmail) {
      const matchedUsers = await User.find({ email: normalizedEmail }).select('_id');
      matchedUsers.forEach((u) => {
        if (!userIdsToCheck.some((id) => id.toString() === u._id.toString())) {
          userIdsToCheck.push(u._id);
        }
      });
    }

    // If phone is provided, find user IDs registered with that phone
    if (cleanPhone && cleanPhone.length >= 10) {
      const phoneRegex = new RegExp(cleanPhone + '$');
      const matchedUsers = await User.find({ phone: phoneRegex }).select('_id');
      matchedUsers.forEach((u) => {
        if (!userIdsToCheck.some((id) => id.toString() === u._id.toString())) {
          userIdsToCheck.push(u._id);
        }
      });
    }

    const orConditions = [];

    if (userIdsToCheck.length > 0) {
      orConditions.push({ user: { $in: userIdsToCheck } });
    }

    if (cleanPhone && cleanPhone.length >= 10) {
      const phoneRegex = new RegExp(cleanPhone + '$');
      orConditions.push({ 'shippingAddress.phone': phoneRegex });
    }

    if (orConditions.length === 0) {
      return false;
    }

    const pastOrder = await Order.findOne({
      $or: orConditions,
      orderStatus: { $nin: excludedStatuses },
    }).select('_id orderId orderStatus');

    return !!pastOrder;
  } else {
    // In-memory mockStore check
    const pastOrder = (mockStore.orders || []).find((order) => {
      if (excludedStatuses.includes(order.orderStatus)) {
        return false;
      }

      // Check user ID directly
      const orderUserId = order.user?._id ? order.user._id.toString() : (order.user ? order.user.toString() : '');
      if (userId && orderUserId && orderUserId === userId.toString()) {
        return true;
      }

      // Check by registered user's email or phone in mockStore.users
      if (orderUserId) {
        const orderUser = (mockStore.users || []).find((u) => u._id && u._id.toString() === orderUserId);
        if (orderUser) {
          if (normalizedEmail && orderUser.email && orderUser.email.trim().toLowerCase() === normalizedEmail) {
            return true;
          }
          if (cleanPhone && orderUser.phone) {
            const userCleanPhone = orderUser.phone.replace(/\D/g, '').slice(-10);
            if (userCleanPhone && userCleanPhone === cleanPhone) {
              return true;
            }
          }
        }
      }

      // Check shippingAddress phone
      if (cleanPhone && order.shippingAddress?.phone) {
        const orderShippingPhone = order.shippingAddress.phone.replace(/\D/g, '').slice(-10);
        if (orderShippingPhone && orderShippingPhone === cleanPhone) {
          return true;
        }
      }

      // Check shippingAddress email (if present)
      if (normalizedEmail && order.shippingAddress?.email) {
        if (order.shippingAddress.email.trim().toLowerCase() === normalizedEmail) {
          return true;
        }
      }

      return false;
    });

    return !!pastOrder;
  }
};
