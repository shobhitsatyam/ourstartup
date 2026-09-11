import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import RewardTransaction from '../models/RewardTransaction.js';
import CmsContent from '../models/CmsContent.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';
import { checkCustomerHasCompletedOrders } from '../utils/customerOrderHelper.js';

const getStoreSettings = async () => {
  let threshold = 799;
  let standardFee = 99;
  let codHandlingFee = 15;
  try {
    if (isMongoConnected) {
      const cms = await CmsContent.findOne({ key: 'store_settings' }).lean();
      if (cms && cms.data) {
        if (cms.data.freeShippingThreshold !== undefined && cms.data.freeShippingThreshold !== null && !isNaN(cms.data.freeShippingThreshold)) {
          threshold = Number(cms.data.freeShippingThreshold);
        }
        if (cms.data.standardShippingFee !== undefined && cms.data.standardShippingFee !== null && !isNaN(cms.data.standardShippingFee)) {
          standardFee = Number(cms.data.standardShippingFee);
        }
        if (cms.data.codHandlingFee !== undefined && cms.data.codHandlingFee !== null && !isNaN(cms.data.codHandlingFee)) {
          codHandlingFee = Number(cms.data.codHandlingFee);
        }
      }
    }
  } catch (err) {
    console.error('Error loading store_settings for order calculation:', err);
  }
  return { freeShippingThreshold: threshold, standardShippingFee: standardFee, codHandlingFee };
};

const generateOrderId = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const random = Math.floor(100000 + Math.random() * 900000);
  return `OJ-${year}-${random}`;
};

export const createOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please login or create an account.' });
    }

    const { orderItems, shippingAddress, paymentMethod, couponCode, redeemOceanPoints } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items found' });
    }

    const pin = shippingAddress?.pincode || shippingAddress?.postalCode;
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.city || !pin) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }
    shippingAddress.pincode = pin;
    shippingAddress.postalCode = pin;
    shippingAddress.address = shippingAddress.address || [shippingAddress.house, shippingAddress.street, shippingAddress.area].filter(Boolean).join(', ');
    shippingAddress.house = shippingAddress.house || shippingAddress.address || '';
    shippingAddress.street = shippingAddress.street || shippingAddress.address || '';

    let itemsPrice = 0;
    const verifiedOrderItems = [];

    if (isMongoConnected) {
      for (const item of orderItems) {
        const prodId = item.product || item._id;
        const isProdValidId = prodId && mongoose.Types.ObjectId.isValid(prodId);
        const dbProduct = isProdValidId ? await Product.findById(prodId) : null;
        const itemPrice = dbProduct ? dbProduct.price : item.price;
        itemsPrice += itemPrice * (item.quantity || 1);
        verifiedOrderItems.push({
          product: dbProduct ? dbProduct._id : (isProdValidId ? prodId : undefined),
          name: dbProduct ? dbProduct.name : item.name,
          slug: dbProduct ? dbProduct.slug : (item.slug || 'piece'),
          image: (dbProduct && dbProduct.images && dbProduct.images[0]) ? dbProduct.images[0] : (item.image || ''),
          price: itemPrice,
          quantity: item.quantity || 1,
          size: item.size || 'Free Size',
          sku: (dbProduct && dbProduct.sku) ? dbProduct.sku : (item.sku || ''),
        });
      }

      const settings = await getStoreSettings();
      const shippingPrice = itemsPrice >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
      const codFee = paymentMethod === 'cod' ? settings.codHandlingFee : 0;
      let discountAmount = 0;
      let validCouponCode = '';

      if (couponCode && couponCode.trim() !== '') {
        const cleanCouponCode = couponCode.trim().toUpperCase();
        const coupon = await Coupon.findOne({ code: cleanCouponCode, isActive: true });
        if (!coupon) {
          return res.status(400).json({ success: false, message: 'Invalid coupon code applied.' });
        }
        if (new Date(coupon.expiryDate) < new Date()) {
          return res.status(400).json({ success: false, message: 'Applied coupon has expired.' });
        }
        if (itemsPrice < (coupon.minOrderAmount || 0)) {
          return res.status(400).json({
            success: false,
            message: `Minimum order value of ₹${coupon.minOrderAmount} required for coupon ${coupon.code}`,
          });
        }

        // Server-side first-order coupon validation (e.g. WELCOME10)
        const isFirstOrderCoupon = coupon.isFirstOrderOnly || cleanCouponCode === 'WELCOME10';
        if (isFirstOrderCoupon) {
          const hasCompletedOrders = await checkCustomerHasCompletedOrders({
            userId: req.user._id,
            email: req.user.email,
            phone: shippingAddress?.phone || req.user.phone,
          });
          if (hasCompletedOrders) {
            return res.status(400).json({
              success: false,
              message: 'This welcome offer is available only on your first order.',
            });
          }
        }

        if (coupon.discountType === 'percentage') {
          const rawDiscount = (itemsPrice * coupon.discountAmount) / 100;
          discountAmount = Math.min(rawDiscount, coupon.maxDiscountAmount || rawDiscount);
        } else {
          discountAmount = Math.min(coupon.discountAmount, itemsPrice);
        }
        validCouponCode = coupon.code;
        coupon.usedCount += 1;
        await coupon.save();
      }

      let oceanPointsUsed = 0;
      if (req.user && req.user._id) {
        const user = await User.findById(req.user._id);
        if (redeemOceanPoints && user && user.oceanPoints >= 500) {
          oceanPointsUsed = 500;
          user.oceanPoints -= oceanPointsUsed;
          await user.save();
          await RewardTransaction.create({
            user: user._id,
            points: -oceanPointsUsed,
            type: 'REDEEMED',
            description: `Redeemed ₹${oceanPointsUsed} discount on order`,
            balanceAfter: user.oceanPoints,
          });
        }
      }

      const payableAmount = Math.max(0, itemsPrice + shippingPrice + codFee - discountAmount - oceanPointsUsed);
      const oceanPointsEarned = Math.floor(payableAmount / 100);
      const orderId = generateOrderId();

      const order = new Order({
        orderId,
        user: req.user?._id || null,
        orderItems: verifiedOrderItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'razorpay',
        itemsPrice,
        taxPrice: 0,
        shippingPrice,
        codFee,
        discountAmount,
        couponCode: validCouponCode,
        oceanPointsUsed,
        oceanPointsEarned,
        totalPrice: payableAmount,
        isPaid: false,
        orderStatus: 'Confirmed',
        statusTimeline: [
          { status: 'Confirmed', note: 'Order placed and confirmed at Zivana Jewels.', timestamp: new Date() },
        ],
        shipmentTracking: {
          courier: 'BlueDart Luxury Express',
          trackingNumber: `OJ-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
          trackingUrl: 'https://shiprocket.co/tracking',
          estimatedDelivery: '2-4 Business Days',
        },
      });

      const savedOrder = await order.save();
      for (const item of verifiedOrderItems) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }
      }

      return res.status(201).json({ success: true, data: savedOrder, message: 'Order placed successfully!' });
    } else {
      // In-Memory Store Logic
      for (const item of orderItems) {
        const prodId = (item.product || item._id || '').toString();
        const prod = mockStore.products.find((p) => p._id && p._id.toString() === prodId);
        const itemPrice = prod ? prod.price : item.price;
        itemsPrice += itemPrice * (item.quantity || 1);
        verifiedOrderItems.push({
          product: prod ? prod._id : prodId,
          name: prod ? prod.name : item.name,
          slug: prod ? prod.slug : (item.slug || 'luxury-piece'),
          image: (prod && prod.images && prod.images[0]) ? prod.images[0] : (item.image || ''),
          price: itemPrice,
          quantity: item.quantity || 1,
          size: item.size || 'Free Size',
          sku: (prod && prod.sku) ? prod.sku : (item.sku || ''),
        });
      }

      const settings = await getStoreSettings();
      const shippingPrice = itemsPrice >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
      const codFee = paymentMethod === 'cod' ? settings.codHandlingFee : 0;
      let discountAmount = 0;
      let validCouponCode = '';

      if (couponCode && couponCode.trim() !== '') {
        const cleanCouponCode = couponCode.trim().toUpperCase();
        const coupon = mockStore.coupons.find(
          (c) => c.code.toUpperCase() === cleanCouponCode && c.isActive
        );
        if (!coupon) {
          return res.status(400).json({ success: false, message: 'Invalid coupon code applied.' });
        }
        if (new Date(coupon.expiryDate) < new Date()) {
          return res.status(400).json({ success: false, message: 'Applied coupon has expired.' });
        }
        if (itemsPrice < (coupon.minOrderAmount || 0)) {
          return res.status(400).json({
            success: false,
            message: `Minimum order value of ₹${coupon.minOrderAmount} required for coupon ${coupon.code}`,
          });
        }

        // Server-side first-order coupon validation (e.g. WELCOME10)
        const isFirstOrderCoupon = coupon.isFirstOrderOnly || cleanCouponCode === 'WELCOME10';
        if (isFirstOrderCoupon) {
          const hasCompletedOrders = await checkCustomerHasCompletedOrders({
            userId: req.user._id,
            email: req.user.email,
            phone: shippingAddress?.phone || req.user.phone,
          });
          if (hasCompletedOrders) {
            return res.status(400).json({
              success: false,
              message: 'This welcome offer is available only on your first order.',
            });
          }
        }

        if (coupon.discountType === 'percentage') {
          const raw = (itemsPrice * coupon.discountAmount) / 100;
          discountAmount = Math.min(raw, coupon.maxDiscountAmount || raw);
        } else {
          discountAmount = Math.min(coupon.discountAmount, itemsPrice);
        }
        validCouponCode = coupon.code;
        coupon.usedCount += 1;
      }

      let oceanPointsUsed = 0;
      if (req.user && req.user._id) {
        const user = mockStore.users.find((u) => u._id && u._id.toString() === req.user._id.toString());
        if (redeemOceanPoints && user && user.oceanPoints >= 500) {
          oceanPointsUsed = 500;
          user.oceanPoints -= oceanPointsUsed;
          mockStore.rewardTransactions.push({
            _id: `rew_${Date.now()}`,
            user: user._id,
            points: -oceanPointsUsed,
            type: 'REDEEMED',
            description: `Redeemed ₹${oceanPointsUsed} discount on order`,
            balanceAfter: user.oceanPoints,
            createdAt: new Date().toISOString(),
          });
        }
      }

      const payableAmount = Math.max(0, itemsPrice + shippingPrice + codFee - discountAmount - oceanPointsUsed);
      const oceanPointsEarned = Math.floor(payableAmount / 100);
      const orderId = generateOrderId();

      const newOrder = {
        _id: `ord_${Date.now()}`,
        orderId,
        user: req.user?._id || 'guest',
        orderItems: verifiedOrderItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'razorpay',
        itemsPrice,
        taxPrice: 0,
        shippingPrice,
        codFee,
        discountAmount,
        couponCode: validCouponCode,
        oceanPointsUsed,
        oceanPointsEarned,
        totalPrice: payableAmount,
        isPaid: false,
        orderStatus: 'Confirmed',
        statusTimeline: [
          { status: 'Confirmed', note: 'Order placed and confirmed at Zivana Jewels.', timestamp: new Date().toISOString() },
        ],
        shipmentTracking: {
          courier: 'BlueDart Luxury Express',
          trackingNumber: `OJ-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
          trackingUrl: 'https://shiprocket.co/tracking',
          estimatedDelivery: '2-4 Business Days',
        },
        createdAt: new Date().toISOString(),
      };

      mockStore.orders.unshift(newOrder);

      // Deduct mock stock
      for (const item of verifiedOrderItems) {
        const p = mockStore.products.find((prod) => prod._id && prod._id.toString() === (item.product || '').toString());
        if (p) p.stock = Math.max(0, p.stock - item.quantity);
      }

      return res.status(201).json({ success: true, data: newOrder, message: 'Order placed successfully!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    if (isMongoConnected) {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json({ success: true, data: orders });
    } else {
      const orders = mockStore.orders.filter(
        (o) => o.user && o.user.toString() === req.user._id.toString()
      );
      res.json({ success: true, data: orders });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      let query = { orderId: id };
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { $or: [{ _id: id }, { orderId: id }] };
      }
      const order = await Order.findOne(query).populate('user', 'name email phone');
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json({ success: true, data: order });
    } else {
      const order = mockStore.orders.find((o) => o._id === id || o.orderId === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json({ success: true, data: order });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.orderStatus === 'Cancelled') {
        return res.json({ success: true, data: order, message: 'Order is already cancelled' });
      }

      if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
        return res.status(400).json({ success: false, message: 'Order has already been dispatched and cannot be cancelled.' });
      }

      order.orderStatus = 'Cancelled';
      order.statusTimeline.push({
        status: 'Cancelled',
        note: 'Order cancelled by patron.',
        timestamp: new Date(),
      });

      // Restore product catalog inventory
      for (const item of order.orderItems || []) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity || 1 } });
        }
      }

      if (order.oceanPointsUsed > 0 && order.user) {
        const user = await User.findById(order.user);
        if (user) {
          user.oceanPoints += order.oceanPointsUsed;
          await user.save();
        }
      }

      await order.save();
      res.json({ success: true, data: order, message: 'Order has been cancelled' });
    } else {
      const order = mockStore.orders.find((o) => o._id === id || o.orderId === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.orderStatus === 'Cancelled') {
        return res.json({ success: true, data: order, message: 'Order is already cancelled' });
      }

      order.orderStatus = 'Cancelled';
      order.statusTimeline.push({
        status: 'Cancelled',
        note: 'Order cancelled by patron.',
        timestamp: new Date().toISOString(),
      });

      for (const item of order.orderItems || []) {
        const prod = mockStore.products.find(
          (p) => p._id && p._id.toString() === (item.product || '').toString()
        );
        if (prod) prod.stock += (item.quantity || 1);
      }

      res.json({ success: true, data: order, message: 'Order has been cancelled' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
