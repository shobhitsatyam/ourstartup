import Coupon from '../models/Coupon.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';
import { checkCustomerHasCompletedOrders } from '../utils/customerOrderHelper.js';

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const cartTotal = req.body.cartTotal ?? req.body.orderAmount ?? req.body.subtotal;
    const email = req.body.email || req.user?.email || '';
    const phone = req.body.phone || req.user?.phone || '';
    const userId = req.user?._id || req.user?.id || req.body.userId;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();
    let coupon;
    if (isMongoConnected) {
      coupon = await Coupon.findOne({ code: cleanCode });
    } else {
      coupon = mockStore.coupons.find((c) => c.code.toUpperCase() === cleanCode);
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This coupon is currently inactive' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon usage limit has been reached' });
    }

    // First-Order Only Security Check (WELCOME10)
    const isFirstOrderCoupon = coupon.isFirstOrderOnly || cleanCode === 'WELCOME10';
    if (isFirstOrderCoupon) {
      const hasCompletedOrders = await checkCustomerHasCompletedOrders({ userId, email, phone });
      if (hasCompletedOrders) {
        return res.status(400).json({
          success: false,
          message: 'This welcome offer is available only on your first order.',
        });
      }
    }

    const total = Number(cartTotal) || 0;
    if (total < (coupon.minOrderAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderAmount} required for this coupon`,
        minOrderAmount: coupon.minOrderAmount,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      const calculated = (total * coupon.discountAmount) / 100;
      discount = Math.min(calculated, coupon.maxDiscountAmount || calculated);
    } else {
      discount = Math.min(coupon.discountAmount, total);
    }

    discount = Math.round(discount);

    return res.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        minOrderAmount: coupon.minOrderAmount || 0,
        maxDiscountAmount: coupon.maxDiscountAmount || 5000,
        calculatedDiscount: discount,
        description: coupon.description,
        isFirstOrderOnly: !!isFirstOrderCoupon,
      },
      message: `Coupon '${coupon.code}' applied! You saved ₹${discount}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    if (isMongoConnected) {
      const coupons = await Coupon.find({ isActive: true, expiryDate: { $gt: now } })
        .select('code description discountType discountAmount minOrderAmount maxDiscountAmount expiryDate isFirstOrderOnly');
      return res.json({ success: true, data: coupons });
    } else {
      const coupons = (mockStore.coupons || []).filter((c) => c.isActive && new Date(c.expiryDate) > now);
      return res.json({ success: true, data: coupons });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }
    const cleanCode = code.trim().toUpperCase();
    let coupon;
    if (isMongoConnected) {
      coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
    } else {
      coupon = (mockStore.coupons || []).find((c) => c.code.toUpperCase() === cleanCode && c.isActive);
    }
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found or inactive' });
    }
    return res.json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        minOrderAmount: coupon.minOrderAmount || 0,
        maxDiscountAmount: coupon.maxDiscountAmount || 5000,
        isFirstOrderOnly: !!coupon.isFirstOrderOnly,
        isActive: coupon.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
