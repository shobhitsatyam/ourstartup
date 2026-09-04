import express from 'express';
import {
  getDashboardMetrics,
  getAdminProducts,
  getNextSkuPreview,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  uploadProductImages,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { handleUploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Apply auth and admin check to all admin routes
router.use(protect, adminOnly);

router.get('/metrics', getDashboardMetrics);

// Product image upload (supports up to 10 images, memoryStorage -> Cloudinary)
router.post('/upload', handleUploadMiddleware, uploadProductImages);

// Product management
router.get('/products/next-sku', getNextSkuPreview);

router.route('/products')
  .get(getAdminProducts)
  .post(createProduct);

router.route('/products/:id')
  .put(updateProduct)
  .delete(deleteProduct);

// Order management
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Customer management
router.get('/customers', getAdminCustomers);

// Coupon management
router.route('/coupons')
  .get(getAdminCoupons)
  .post(createCoupon);

router.route('/coupons/:id')
  .put(updateCoupon)
  .delete(deleteCoupon);

router.patch('/coupons/:id/status', toggleCouponStatus);

export default router;
