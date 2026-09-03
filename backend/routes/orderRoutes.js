import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(optionalProtect, createOrder);

router.route('/my-orders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(optionalProtect, getOrderById);

router.route('/:id/cancel')
  .put(optionalProtect, cancelOrder);

export default router;
