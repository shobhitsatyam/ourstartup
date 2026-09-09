import express from 'express';
import { validateCoupon, getActiveCoupons, getCouponByCode } from '../controllers/couponController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/active', getActiveCoupons);
router.get('/:code', getCouponByCode);
router.post('/validate', optionalProtect, validateCoupon);

export default router;
