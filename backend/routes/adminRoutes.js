import express from 'express';
import {
  getDashboardMetrics,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getAdminCoupons,
  createCoupon,
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

router.delete('/coupons/:id', deleteCoupon);

export default router;
