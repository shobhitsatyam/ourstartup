import Coupon from '../models/Coupon.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
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

    const total = Number(cartTotal) || 0;
    if (total < (coupon.minOrderAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderAmount} required for this coupon`,
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
        calculatedDiscount: discount,
        description: coupon.description,
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
        .select('code description discountType discountAmount minOrderAmount maxDiscountAmount expiryDate');
      return res.json({ success: true, data: coupons });
    } else {
      const coupons = (mockStore.coupons || []).filter((c) => c.isActive && new Date(c.expiryDate) > now);
      return res.json({ success: true, data: coupons });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
