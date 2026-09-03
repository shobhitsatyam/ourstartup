import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  size: { type: String, default: 'Free Size' },
});

const statusTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      house: { type: String, required: true },
      street: { type: String, required: true },
      area: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String, default: '' },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['razorpay', 'upi', 'card', 'cod'],
      default: 'razorpay',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      razorpay_order_id: { type: String },
      razorpay_payment_id: { type: String },
      razorpay_signature: { type: String },
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    discountAmount: { type: Number, required: true, default: 0.0 },
    couponCode: { type: String, default: '' },
    oceanPointsUsed: { type: Number, required: true, default: 0 },
    oceanPointsEarned: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Returned',
        'Refunded',
      ],
      default: 'Confirmed',
    },
    statusTimeline: [statusTimelineSchema],
    shipmentTracking: {
      courier: { type: String, default: 'BlueDart Luxury Express via Shiprocket' },
      trackingNumber: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
      estimatedDelivery: { type: String, default: '2-4 Business Days' },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
