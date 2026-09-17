import mongoose from 'mongoose';

const paymentAttemptSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      index: true,
      default: '',
    },
    razorpayOrderId: {
      type: String,
      index: true,
      default: '',
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'cashfree', 'cod', 'other'],
      default: 'razorpay',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    orderId: {
      type: String,
      index: true,
      required: true,
    },
    customerName: {
      type: String,
      default: 'Zivana Patron',
    },
    customerEmail: {
      type: String,
      default: '',
    },
    customerPhone: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      default: 'Razorpay Online',
    },
    status: {
      type: String,
      enum: ['captured', 'failed', 'refunded', 'pending', 'cancelled'],
      default: 'pending',
      index: true,
    },
    errorCode: {
      type: String,
      default: '',
    },
    failureReason: {
      type: String,
      default: '',
    },
    rawResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentAttempt = mongoose.model('PaymentAttempt', paymentAttemptSchema);
export default PaymentAttempt;
