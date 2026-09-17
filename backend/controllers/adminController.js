import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import PaymentAttempt from '../models/PaymentAttempt.js';
import { getNextSku } from '../models/SkuCounter.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';
import { uploadStreamToCloudinary } from '../config/cloudinary.js';
import { invalidateCuratedHighlightsCache } from './productController.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    const CANCELLED_STATUSES = [
      'Cancelled',
      'cancelled',
      'Canceled',
      'canceled',
      'Refunded',
      'refunded',
      'Returned',
      'returned',
    ];

    if (isMongoConnected) {
      const genuineOrderQuery = {
        $or: [
          { isPaid: true },
          { paymentMethod: 'cod' },
          { 'paymentResult.status': { $ne: 'FAILED' } },
        ],
      };

      const totalOrders = await Order.countDocuments(genuineOrderQuery);
      const totalCustomers = await User.countDocuments({ role: 'user' });
      const totalProducts = await Product.countDocuments();
      const lowStockCount = await Product.countDocuments({ stock: { $lte: 5 } });

      const revenueAgg = await Order.aggregate([
        {
          $match: {
            orderStatus: { $nin: CANCELLED_STATUSES },
            'paymentResult.status': { $ne: 'FAILED' },
            $or: [
              { isPaid: true },
              { paymentMethod: 'cod' },
            ],
          },
        },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
      ]);
      const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

      const recentOrders = await Order.find(genuineOrderQuery)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(8);

      const topProducts = await Product.find({ isActive: true })
        .sort({ isBestseller: -1, rating: -1 })
        .limit(5);

      return res.json({
        success: true,
        data: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          lowStockCount,
          recentOrders,
          topProducts,
        },
      });
    } else {
      const isGenuineOrder = (o) => {
        const payStatus = String(o.paymentResult?.status || '').trim().toUpperCase();
        if (payStatus === 'FAILED' && !o.isPaid) return false;
        return true;
      };

      const isOrderRevenueValid = (o) => {
        if (!isGenuineOrder(o)) return false;
        const s = String(o.orderStatus || o.status || '').trim().toLowerCase();
        if (['cancelled', 'canceled', 'refunded', 'returned'].includes(s)) return false;
        const method = String(o.paymentMethod || '').trim().toLowerCase();
        return o.isPaid || method === 'cod';
      };

      const genuineOrdersList = mockStore.orders.filter(isGenuineOrder);
      const totalOrders = genuineOrdersList.length;
      const totalCustomers = mockStore.users.filter((u) => u.role === 'user').length;
      const totalProducts = mockStore.products.length;
      const lowStockCount = mockStore.products.filter((p) => p.stock <= 5).length;
      const totalRevenue = mockStore.orders.reduce(
        (sum, o) => sum + (isOrderRevenueValid(o) ? (Number(o.totalPrice) || Number(o.totalAmount) || 0) : 0),
        0
      );
      const recentOrders = genuineOrdersList.slice(0, 8);
      const topProducts = mockStore.products.slice(0, 5);

      return res.json({
        success: true,
        data: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          lowStockCount,
          recentOrders,
          topProducts,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    if (isMongoConnected) {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: products });
    } else {
      return res.json({ success: true, data: mockStore.products });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNextSkuPreview = async (req, res) => {
  try {
    const { category } = req.query;
    const sku = await getNextSku(category || 'Earrings', true);
    return res.json({ success: true, sku });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      shortDescription,
      category,
      subCategory,
      gender,
      price,
      originalPrice,
      stock,
      images,
      material,
      finish,
      sizes,
      isNewArrival,
      isBestseller,
      isTrending,
      isAntiTarnish,
      tags,
      rating,
      testimonial,
    } = req.body;

    const generatedSlug = (slug || name)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Auto-generate unique persistent SKU based on category
    const generatedSku = await getNextSku(category || 'Earrings', false);

    const priceNum = Number(price) || 0;
    const origNum = originalPrice ? Number(originalPrice) : 0;
    const calculatedDiscount = origNum > priceNum && origNum > 0
      ? Math.round(((origNum - priceNum) / origNum) * 100)
      : 0;

    const parsedRating = rating !== undefined && !isNaN(Number(rating)) ? Number(rating) : 4.8;
    const parsedTestimonial = testimonial && typeof testimonial === 'object' ? {
      reviewerName: testimonial.reviewerName || '',
      reviewerLocation: testimonial.reviewerLocation || '',
      reviewText: testimonial.reviewText || '',
      rating: testimonial.rating ? Number(testimonial.rating) : 5,
      reviewBadge: testimonial.reviewBadge || '',
    } : {
      reviewerName: '',
      reviewerLocation: '',
      reviewText: '',
      rating: 5,
      reviewBadge: '',
    };

    if (isMongoConnected) {
      const product = new Product({
        name,
        slug: generatedSlug,
        sku: generatedSku,
        description,
        shortDescription: shortDescription || '',
        category,
        subCategory: subCategory || category,
        gender: gender ? gender.toLowerCase() : 'women',
        price: priceNum,
        originalPrice: origNum,
        discount: calculatedDiscount,
        stock: Number(stock) || 20,
        images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'],
        material: material || '316L Stainless Steel & 18K Gold PVD',
        finish: finish || 'High Polish Mirror Finish',
        sizes: sizes && sizes.length > 0 ? sizes : ['Free Size'],
        rating: parsedRating,
        testimonial: parsedTestimonial,
        isNewArrival: isNewArrival !== undefined ? isNewArrival : true,
        isBestseller: isBestseller !== undefined ? isBestseller : false,
        isTrending: isTrending !== undefined ? isTrending : false,
        isAntiTarnish: isAntiTarnish !== undefined ? isAntiTarnish : true,
        isActive: true,
        tags: tags || ['Jewellery', category],
      });
      const savedProduct = await product.save();
      invalidateCuratedHighlightsCache();
      return res.status(201).json({ success: true, data: savedProduct, message: 'Product created successfully' });
    } else {
      const newProd = {
        _id: `prod_custom_${Date.now()}`,
        name,
        slug: generatedSlug,
        sku: generatedSku,
        description,
        shortDescription: shortDescription || '',
        category,
        subCategory: subCategory || category,
        gender: gender ? gender.toLowerCase() : 'women',
        price: priceNum,
        originalPrice: origNum,
        discount: calculatedDiscount,
        stock: Number(stock) || 20,
        images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'],
        material: material || '316L Stainless Steel & 18K Gold PVD',
        finish: finish || 'High Polish Mirror Finish',
        sizes: sizes && sizes.length > 0 ? sizes : ['Free Size'],
        rating: parsedRating,
        testimonial: parsedTestimonial,
        numReviews: 0,
        isNewArrival: isNewArrival !== undefined ? isNewArrival : true,
        isBestseller: isBestseller !== undefined ? isBestseller : false,
        isTrending: isTrending !== undefined ? isTrending : false,
        isAntiTarnish: isAntiTarnish !== undefined ? isAntiTarnish : true,
        isActive: true,
        tags: tags || ['Jewellery', category],
        createdAt: new Date().toISOString(),
      };
      mockStore.products.unshift(newProd);
      invalidateCuratedHighlightsCache();
      return res.status(201).json({ success: true, data: newProd, message: 'Product created successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (isMongoConnected) {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      Object.assign(product, req.body);

      if (req.body.rating !== undefined && !isNaN(Number(req.body.rating))) {
        product.rating = Number(req.body.rating);
      }
      if (req.body.testimonial !== undefined && typeof req.body.testimonial === 'object') {
        product.testimonial = {
          reviewerName: req.body.testimonial.reviewerName || '',
          reviewerLocation: req.body.testimonial.reviewerLocation || '',
          reviewText: req.body.testimonial.reviewText || '',
          rating: req.body.testimonial.rating ? Number(req.body.testimonial.rating) : 5,
          reviewBadge: req.body.testimonial.reviewBadge || '',
        };
      }

      // Recalculate discount if prices change
      if (req.body.price !== undefined || req.body.originalPrice !== undefined) {
        const currentPrice = req.body.price !== undefined ? Number(req.body.price) : product.price;
        const currentOrig = req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : (product.originalPrice || 0);
        if (currentOrig > currentPrice && currentOrig > 0) {
          product.discount = Math.round(((currentOrig - currentPrice) / currentOrig) * 100);
        } else {
          product.discount = 0;
        }
      }

      const updatedProduct = await product.save();
      invalidateCuratedHighlightsCache();
      return res.json({ success: true, data: updatedProduct, message: 'Product updated successfully' });
    } else {
      const product = mockStore.products.find((p) => p._id.toString() === req.params.id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      Object.assign(product, req.body);

      if (req.body.price !== undefined || req.body.originalPrice !== undefined) {
        const currentPrice = req.body.price !== undefined ? Number(req.body.price) : product.price;
        const currentOrig = req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : (product.originalPrice || 0);
        if (currentOrig > currentPrice && currentOrig > 0) {
          product.discount = Math.round(((currentOrig - currentPrice) / currentOrig) * 100);
        } else {
          product.discount = 0;
        }
      }

      invalidateCuratedHighlightsCache();
      return res.json({ success: true, data: product, message: 'Product updated successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    if (isMongoConnected) {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      invalidateCuratedHighlightsCache();
      return res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      const idx = mockStore.products.findIndex((p) => p._id.toString() === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
      mockStore.products.splice(idx, 1);
      invalidateCuratedHighlightsCache();
      return res.json({ success: true, message: 'Product deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const { status, tab } = req.query;
    const STATUS_MAP = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      packed: 'Packed',
      shipped: 'Shipped',
      'in transit': 'In Transit',
      'out for delivery': 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      canceled: 'Cancelled',
      returned: 'Returned',
      refunded: 'Refunded',
    };

    if (isMongoConnected) {
      const query = {};

      // 1. Tab-based filtering for genuine orders vs payment state
      const selectedTab = (tab || 'all').trim().toLowerCase();
      if (selectedTab === 'paid') {
        // Genuine orders where online payment has been successfully verified/captured
        query.isPaid = true;
        query.paymentMethod = { $ne: 'cod' };
      } else if (selectedTab === 'cod') {
        // Genuine orders where paymentMethod is COD (independent of Razorpay)
        query.paymentMethod = 'cod';
      } else if (selectedTab === 'pending') {
        // Genuine orders created in DB whose online payment is pending/incomplete (not hard-failed attempts)
        query.isPaid = false;
        query.paymentMethod = { $ne: 'cod' };
        query.orderStatus = { $nin: ['Cancelled', 'cancelled', 'Canceled', 'canceled', 'Refunded', 'refunded'] };
        query['paymentResult.status'] = { $ne: 'FAILED' };
      } else if (selectedTab === 'cancelled') {
        query.orderStatus = { $in: ['Cancelled', 'cancelled', 'Canceled', 'canceled'] };
      } else if (selectedTab === 'refunded') {
        query.$or = [
          { orderStatus: { $in: ['Refunded', 'refunded'] } },
          { 'paymentResult.status': 'REFUNDED' },
        ];
      } else {
        // ALL ORDERS: Genuine ecommerce orders according to application's actual order lifecycle.
        // Excludes records that are solely uncompleted failed payment attempts
        query.$or = [
          { isPaid: true },
          { paymentMethod: 'cod' },
          { 'paymentResult.status': { $ne: 'FAILED' } },
        ];
      }

      // 2. Secondary orderStatus filter (e.g. Shipped, Delivered)
      if (status && status !== 'all') {
        const normalized = STATUS_MAP[status.trim().toLowerCase()] || status;
        query.orderStatus = normalized;
      }

      const orders = await Order.find(query).populate('user', 'name email phone').sort({ createdAt: -1 });
      return res.json({ success: true, data: orders });
    } else {
      let orders = mockStore.orders;
      const selectedTab = (tab || 'all').trim().toLowerCase();

      // Tab filtering in memory
      if (selectedTab === 'paid') {
        orders = orders.filter((o) => o.isPaid && o.paymentMethod !== 'cod');
      } else if (selectedTab === 'cod') {
        orders = orders.filter((o) => o.paymentMethod === 'cod');
      } else if (selectedTab === 'pending') {
        orders = orders.filter((o) => {
          const s = String(o.orderStatus || o.status || '').trim().toLowerCase();
          const paySt = String(o.paymentResult?.status || '').trim().toUpperCase();
          return !o.isPaid && o.paymentMethod !== 'cod' && !['cancelled', 'canceled', 'refunded'].includes(s) && paySt !== 'FAILED';
        });
      } else if (selectedTab === 'cancelled') {
        orders = orders.filter((o) => {
          const s = String(o.orderStatus || o.status || '').trim().toLowerCase();
          return s === 'cancelled' || s === 'canceled';
        });
      } else if (selectedTab === 'refunded') {
        orders = orders.filter((o) => {
          const s = String(o.orderStatus || o.status || '').trim().toLowerCase();
          const paySt = String(o.paymentResult?.status || '').trim().toUpperCase();
          return s === 'refunded' || paySt === 'REFUNDED';
        });
      } else {
        // All Genuine orders
        orders = orders.filter((o) => {
          const paySt = String(o.paymentResult?.status || '').trim().toUpperCase();
          return o.isPaid || o.paymentMethod === 'cod' || paySt !== 'FAILED';
        });
      }

      // Secondary status filter
      if (status && status !== 'all') {
        const lower = status.trim().toLowerCase();
        orders = orders.filter((o) => {
          const s = String(o.orderStatus || o.status || '').trim().toLowerCase();
          return s === lower || (lower === 'cancelled' && s === 'canceled');
        });
      }

      return res.json({ success: true, data: orders });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/payments
 * Fetches gateway payment attempts & transactions with diagnostics
 */
export const getAdminPayments = async (req, res) => {
  try {
    const { status, tab, search } = req.query;
    const filterStatus = (status || tab || 'all').trim().toLowerCase();

    let attempts = [];

    if (isMongoConnected) {
      const query = {};
      if (filterStatus && filterStatus !== 'all') {
        if (filterStatus === 'captured') {
          query.status = 'captured';
        } else if (filterStatus === 'failed') {
          query.status = 'failed';
        } else if (filterStatus === 'refunded') {
          query.status = 'refunded';
        }
      }

      if (search && search.trim()) {
        const s = search.trim();
        query.$or = [
          { paymentId: { $regex: s, $options: 'i' } },
          { razorpayOrderId: { $regex: s, $options: 'i' } },
          { orderId: { $regex: s, $options: 'i' } },
          { customerName: { $regex: s, $options: 'i' } },
          { customerEmail: { $regex: s, $options: 'i' } },
        ];
      }

      attempts = await PaymentAttempt.find(query).sort({ createdAt: -1 }).lean();

      // Backwards Compatibility: If historical orders exist with paymentResult that aren't yet in PaymentAttempt
      const existingPaymentIds = new Set(attempts.map((a) => a.paymentId).filter(Boolean));

      const historicalOrders = await Order.find({
        $or: [
          { 'paymentResult.id': { $exists: true, $ne: null } },
          { 'paymentResult.razorpay_payment_id': { $exists: true, $ne: null } },
          { 'paymentResult.cf_payment_id': { $exists: true, $ne: null } },
          { 'paymentResult.status': 'FAILED' },
        ],
      })
        .populate('user', 'name email phone')
        .lean();

      for (const order of historicalOrders) {
        const pResult = order.paymentResult || {};
        const payId = pResult.razorpay_payment_id || pResult.cf_payment_id || pResult.id;
        const normalizedPayId = payId || `order_pay_${order.orderId}`;

        if (!existingPaymentIds.has(normalizedPayId)) {
          const isCaptured = order.isPaid || pResult.status === 'SUCCESS';
          const isFailed = pResult.status === 'FAILED';
          const isRefunded = order.orderStatus === 'Refunded' || pResult.status === 'REFUNDED';
          let st = 'pending';
          if (isRefunded) st = 'refunded';
          else if (isCaptured) st = 'captured';
          else if (isFailed) st = 'failed';

          if (filterStatus === 'all' || filterStatus === st) {
            attempts.push({
              _id: `hist_${order._id}`,
              paymentId: payId || 'N/A',
              razorpayOrderId: order.razorpayOrderId || pResult.razorpay_order_id || '',
              gateway: order.paymentMethod === 'cashfree' ? 'cashfree' : (order.paymentMethod === 'cod' ? 'cod' : 'razorpay'),
              order: order._id,
              orderId: order.orderId,
              customerName: order.shippingAddress?.fullName || order.user?.name || 'Zivana Patron',
              customerEmail: order.user?.email || order.shippingAddress?.email || '',
              customerPhone: order.shippingAddress?.phone || order.user?.phone || '',
              amount: Number(order.totalPrice) || 0,
              currency: 'INR',
              paymentMethod: pResult.payment_method || (order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay Online'),
              status: st,
              errorCode: pResult.error_code || '',
              failureReason: pResult.payment_message || (isFailed ? 'Payment failed at gateway' : ''),
              createdAt: order.paidAt || order.createdAt || new Date(),
              updatedAt: order.updatedAt || order.createdAt || new Date(),
            });
            existingPaymentIds.add(normalizedPayId);
          }
        }
      }

      // Re-sort combined list by date descending
      attempts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      attempts = [...(mockStore.paymentAttempts || [])];
      if (filterStatus && filterStatus !== 'all') {
        attempts = attempts.filter((p) => p.status === filterStatus);
      }
      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        attempts = attempts.filter(
          (p) =>
            (p.paymentId && p.paymentId.toLowerCase().includes(s)) ||
            (p.orderId && p.orderId.toLowerCase().includes(s)) ||
            (p.customerName && p.customerName.toLowerCase().includes(s)) ||
            (p.customerEmail && p.customerEmail.toLowerCase().includes(s))
        );
      }
      attempts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({ success: true, data: attempts });
  } catch (error) {
    console.error('[getAdminPayments Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber, courier } = req.body;

    const STATUS_MAP = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      packed: 'Packed',
      shipped: 'Shipped',
      'in transit': 'In Transit',
      'out for delivery': 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      canceled: 'Cancelled',
      returned: 'Returned',
      refunded: 'Refunded',
    };

    const normalizedStatus = status
      ? (STATUS_MAP[status.trim().toLowerCase()] || status)
      : undefined;

    if (isMongoConnected) {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      
      if (normalizedStatus) {
        const previousStatus = order.orderStatus;
        order.orderStatus = normalizedStatus;
        order.statusTimeline.push({
          status: normalizedStatus,
          note: note || `Order status updated to ${normalizedStatus} by Admin.`,
          timestamp: new Date(),
        });

        // Restore catalog inventory if order transitioned to Cancelled
        if (normalizedStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
          for (const item of order.orderItems || []) {
            if (item.product) {
              await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity || 1 } });
            }
          }
        }
      }
      if (trackingNumber) order.shipmentTracking.trackingNumber = trackingNumber;
      if (courier) order.shipmentTracking.courier = courier;
      const updatedOrder = await order.save();
      return res.json({ success: true, data: updatedOrder, message: 'Order updated successfully' });
    } else {
      const order = mockStore.orders.find((o) => o._id === req.params.id || o.orderId === req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      if (normalizedStatus) {
        const previousStatus = order.orderStatus;
        order.orderStatus = normalizedStatus;
        order.statusTimeline.push({
          status: normalizedStatus,
          note: note || `Order status updated to ${normalizedStatus} by Admin.`,
          timestamp: new Date().toISOString(),
        });

        // Restore mock inventory if order transitioned to Cancelled
        if (normalizedStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
          for (const item of order.orderItems || []) {
            const prod = mockStore.products.find(
              (p) => p._id && p._id.toString() === (item.product || '').toString()
            );
            if (prod) prod.stock += (item.quantity || 1);
          }
        }
      }
      if (trackingNumber) order.shipmentTracking.trackingNumber = trackingNumber;
      if (courier) order.shipmentTracking.courier = courier;
      return res.json({ success: true, data: order, message: 'Order updated successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminCustomers = async (req, res) => {
  try {
    if (isMongoConnected) {
      const customers = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
      const enhanced = await Promise.all(
        customers.map(async (customer) => {
          const orders = await Order.find({ user: customer._id });
          const totalSpent = orders.reduce((sum, ord) => sum + (ord.orderStatus !== 'Cancelled' ? ord.totalPrice : 0), 0);
          return { ...customer.toObject(), orderCount: orders.length, totalSpent };
        })
      );
      return res.json({ success: true, data: enhanced });
    } else {
      const customers = mockStore.users.filter((u) => u.role === 'user');
      const enhanced = customers.map((c) => {
        const orders = mockStore.orders.filter((o) => (o.user._id || o.user) === c._id);
        const totalSpent = orders.reduce((sum, ord) => sum + (ord.orderStatus !== 'Cancelled' ? ord.totalPrice : 0), 0);
        return { ...c, orderCount: orders.length, totalSpent };
      });
      return res.json({ success: true, data: enhanced });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminCoupons = async (req, res) => {
  try {
    if (isMongoConnected) {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: coupons });
    } else {
      return res.json({ success: true, data: mockStore.coupons });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountAmount, minOrderAmount, maxDiscountAmount, expiryDate, usageLimit, isActive } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });

    if (isMongoConnected) {
      const exists = await Coupon.findOne({ code: code.toUpperCase() });
      if (exists) return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      const coupon = await Coupon.create({
        code: code.toUpperCase(),
        description: description || '',
        discountType: discountType || 'percentage',
        discountAmount: Number(discountAmount),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: Number(maxDiscountAmount) || 5000,
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: Number(usageLimit) || 1000,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      });
      return res.status(201).json({ success: true, data: coupon, message: 'Coupon created successfully' });
    } else {
      const exists = mockStore.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
      if (exists) return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      const newCoupon = {
        _id: `coup_${Date.now()}`,
        code: code.toUpperCase(),
        description: description || '',
        discountType: discountType || 'percentage',
        discountAmount: Number(discountAmount),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: Number(maxDiscountAmount) || 5000,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        usageLimit: Number(usageLimit) || 1000,
        usedCount: 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      };
      mockStore.coupons.unshift(newCoupon);
      return res.status(201).json({ success: true, data: newCoupon, message: 'Coupon created successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountAmount, minOrderAmount, maxDiscountAmount, expiryDate, usageLimit, isActive } = req.body;
    if (isMongoConnected) {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

      if (code && code.toUpperCase() !== coupon.code) {
        const duplicate = await Coupon.findOne({ code: code.toUpperCase(), _id: { $ne: coupon._id } });
        if (duplicate) return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        coupon.code = code.toUpperCase();
      }

      if (description !== undefined) coupon.description = description;
      if (discountType !== undefined) coupon.discountType = discountType;
      if (discountAmount !== undefined) coupon.discountAmount = Number(discountAmount);
      if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
      if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Number(maxDiscountAmount);
      if (expiryDate !== undefined) coupon.expiryDate = new Date(expiryDate);
      if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
      if (isActive !== undefined) coupon.isActive = Boolean(isActive);

      const updated = await coupon.save();
      return res.json({ success: true, data: updated, message: 'Coupon updated successfully' });
    } else {
      const coupon = mockStore.coupons.find((c) => c._id === req.params.id);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

      if (code && code.toUpperCase() !== coupon.code) {
        const duplicate = mockStore.coupons.find((c) => c.code === code.toUpperCase() && c._id !== req.params.id);
        if (duplicate) return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        coupon.code = code.toUpperCase();
      }

      if (description !== undefined) coupon.description = description;
      if (discountType !== undefined) coupon.discountType = discountType;
      if (discountAmount !== undefined) coupon.discountAmount = Number(discountAmount);
      if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
      if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Number(maxDiscountAmount);
      if (expiryDate !== undefined) coupon.expiryDate = new Date(expiryDate).toISOString();
      if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
      if (isActive !== undefined) coupon.isActive = Boolean(isActive);

      return res.json({ success: true, data: coupon, message: 'Coupon updated successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleCouponStatus = async (req, res) => {
  try {
    if (isMongoConnected) {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      coupon.isActive = !coupon.isActive;
      await coupon.save();
      return res.json({
        success: true,
        data: coupon,
        message: `Coupon '${coupon.code}' is now ${coupon.isActive ? 'Active' : 'Deactivated'}`,
      });
    } else {
      const coupon = mockStore.coupons.find((c) => c._id === req.params.id);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      coupon.isActive = !coupon.isActive;
      return res.json({
        success: true,
        data: coupon,
        message: `Coupon '${coupon.code}' is now ${coupon.isActive ? 'Active' : 'Deactivated'}`,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    if (isMongoConnected) {
      const coupon = await Coupon.findByIdAndDelete(req.params.id);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      return res.json({ success: true, message: 'Coupon deleted successfully' });
    } else {
      const idx = mockStore.coupons.findIndex((c) => c._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Coupon not found' });
      mockStore.coupons.splice(idx, 1);
      return res.json({ success: true, message: 'Coupon deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadProductImages = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided for upload.',
      });
    }

    // Upload each buffer to Cloudinary in ocean_jewel/products folder
    const uploadPromises = files.map((file) =>
      uploadStreamToCloudinary(file.buffer, 'ocean_jewel/products')
    );

    const uploadResults = await Promise.all(uploadPromises);
    const urls = uploadResults.map((r) => r.secure_url);

    return res.json({
      success: true,
      urls,
    });
  } catch (error) {
    console.error('❌ [Cloudinary Upload Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload images to Cloudinary.',
    });
  }
};

