import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Sparkles,
  ArrowLeft,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data?.success) {
        setOrder(res.data.data);
      }
    } catch (e) {
      console.error('Failed fetching order details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you wish to cancel this order?')) return;
    try {
      const res = await api.put(`/orders/${order._id}/cancel`);
      if (res.data?.success) {
        addToast('Order cancelled successfully', 'info');
        fetchOrder();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to cancel order', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9FF]">
        <div className="w-12 h-12 rounded-full border-2 border-[#D6CFFF] border-t-[#17151F] animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="font-serif text-2xl font-light">Order Not Found</h2>
        <Link to="/account" className="mt-4 px-6 py-2.5 bg-[#17151F] text-white rounded-xl text-xs font-semibold">
          Return to My Account
        </Link>
      </div>
    );
  }

  const trackingSteps = [
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const currentStepIndex = trackingSteps.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-[#FAF9FF] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          to="/account"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account Orders</span>
        </Link>

        {/* Order Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D6CFFF]/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7464B8]">
              Order Timeline & Delivery Status
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#17151F] mt-1">
              Order #{order.orderId}
            </h1>
            <p className="text-xs text-gray-400 font-light mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              order.orderStatus === 'Delivered'
                ? 'bg-emerald-100 text-emerald-800'
                : order.orderStatus === 'Cancelled'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-[#17151F] text-[#D6CFFF]'
            }`}>
              Status: {order.orderStatus}
            </span>

            {order.orderStatus !== 'Shipped' && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
              <button
                onClick={handleCancelOrder}
                className="text-[11px] font-semibold text-rose-600 hover:underline"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Animated Order Tracking Timeline */}
        {order.orderStatus !== 'Cancelled' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D6CFFF]/60 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium text-gray-900">
                Shipment Tracking Timeline
              </h3>
              <span className="text-xs font-semibold text-[#7464B8]">
                Courier: {order.shipmentTracking?.courier || 'BlueDart Luxury Express'}
              </span>
            </div>

            {/* Step Progress Line */}
            <div className="relative pt-4 pb-2">
              <div className="hidden sm:flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-[#7464B8] -translate-y-1/2 z-0 transition-all duration-700"
                  style={{
                    width: currentStepIndex >= 0 ? `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%` : '0%',
                  }}
                />

                {trackingSteps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                          isDone
                            ? 'bg-[#17151F] text-[#D6CFFF] border-2 border-[#D6CFFF]'
                            : 'bg-white text-gray-400 border border-gray-200'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4 text-[#D6CFFF]" /> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-semibold mt-2 uppercase tracking-wider ${
                        isCurrent ? 'text-[#17151F] font-bold' : isDone ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Timeline List */}
              <div className="sm:hidden space-y-3">
                {trackingSteps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  return (
                    <div key={step} className="flex items-center gap-3 text-xs">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                        isDone ? 'bg-[#17151F] text-[#D6CFFF]' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className={`font-semibold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking Reference & AWB */}
            <div className="p-4 rounded-2xl bg-[#F8F7FF] border border-[#D6CFFF]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-gray-500">Tracking Airway Bill (AWB): </span>
                <strong className="text-gray-900 font-mono">{order.shipmentTracking?.trackingNumber || 'OJ-TRK-9812401'}</strong>
              </div>
              <a
                href={order.shipmentTracking?.trackingUrl || 'https://shiprocket.co/tracking'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#7464B8] font-bold hover:underline"
              >
                <span>Live Shiprocket Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Ordered Items & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Ordered Line Items */}
          <div className="md:col-span-7 rounded-3xl bg-white p-6 sm:p-8 border border-[#D6CFFF]/60 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-medium text-gray-900 pb-3 border-b border-gray-100">
              Ordered Creations ({order.orderItems.length})
            </h3>

            <div className="space-y-4 divide-y divide-gray-100">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="pt-3 flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-20 rounded-2xl object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 text-xs flex flex-col justify-between">
                    <div>
                      <Link to={`/products/${item.slug}`} className="font-semibold text-sm text-gray-900 hover:text-[#7464B8]">
                        {item.name}
                      </Link>
                      <p className="text-gray-500 mt-0.5">Size / Dimension: {item.size}</p>
                      <p className="text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Invoice Breakdown */}
          <div className="md:col-span-5 space-y-6">
            {/* Delivery Address */}
            <div className="p-6 rounded-3xl bg-white border border-[#D6CFFF]/60 shadow-sm space-y-3">
              <h4 className="font-serif text-base font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#7464B8]" />
                <span>Shipping Address</span>
              </h4>
              <div className="text-xs text-gray-600 leading-relaxed">
                <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.house}, {order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                <p className="mt-1 text-gray-500">Mobile: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Financial Invoice Breakdown */}
            <div className="p-6 rounded-3xl bg-white border border-[#D6CFFF]/60 shadow-sm space-y-3">
              <h4 className="font-serif text-base font-medium text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#7464B8]" />
                <span>Payment Summary</span>
              </h4>

              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Items Total</span>
                  <span className="font-semibold text-gray-900">₹{order.itemsPrice.toLocaleString('en-IN')}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {order.oceanPointsUsed > 0 && (
                  <div className="flex justify-between text-[#7464B8] font-medium">
                    <span>Ocean Points Redeemed</span>
                    <span>-₹{order.oceanPointsUsed.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                Payment Mode: <strong className="uppercase text-gray-800">{order.paymentMethod}</strong> &bull; {order.isPaid ? 'Paid' : 'Pending Payment'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
