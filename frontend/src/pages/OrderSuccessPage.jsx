import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  MapPin,
  CreditCard,
  Banknote,
  RotateCcw,
  Clock
} from 'lucide-react';
import api from '../services/api';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Launch luxury celebratory confetti
    confetti({
      particleCount: 90,
      spread: 65,
      origin: { y: 0.55 },
      colors: ['#D6CFFF', '#17151F', '#F4E8C1', '#B6ABF4', '#E8E3FF'],
    });

    if (orderId) {
      api.get(`/orders/${orderId}`)
        .then((res) => {
          if (res.data?.success) {
            setOrder(res.data.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const isCod = order?.paymentMethod?.toLowerCase() === 'cod';
  const displayOrderId = order?.orderId || orderId || 'OJ-CONFIRMED';
  const orderItems = order?.orderItems || [];
  const oceanPoints = order?.oceanPointsEarned ?? Math.floor((order?.totalPrice || 0) / 100);

  return (
    <div className="min-h-screen bg-[#FAF9FF] pt-4 pb-28 sm:pt-6 sm:pb-32 lg:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 lg:p-10 border border-[#D6CFFF]/60 shadow-lg sm:shadow-xl space-y-4 sm:space-y-5 lg:space-y-7"
        >
          {/* Header & Celebration */}
          <div className="text-center space-y-2 sm:space-y-2.5 lg:space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 rounded-full bg-gradient-to-tr from-[#D6CFFF] to-[#E8E3FF] text-[#17151F] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(214,207,255,0.6)] lg:shadow-[0_0_28px_rgba(214,207,255,0.7)]">
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 text-[#17151F]" />
            </div>

            <div>
              <span className="text-[9.5px] sm:text-[10.5px] lg:text-[11px] font-bold uppercase tracking-[0.25em] lg:tracking-[0.3em] text-[#7464B8]">
                Order Confirmed
              </span>
              <h1 className="font-serif text-lg sm:text-2xl lg:text-4xl font-light text-[#17151F] mt-0.5 lg:mt-1 tracking-tight">
                THANK YOU FOR YOUR PATRONAGE
              </h1>
              <p className="text-[11px] sm:text-xs lg:text-sm text-gray-500 font-light mt-1 lg:mt-1.5 max-w-lg mx-auto leading-snug lg:leading-relaxed">
                Your order has been placed successfully and is being packed with our signature tamper-evident satin presentation packaging.
              </p>
            </div>
          </div>

          {/* Key Reference Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 sm:p-3.5 lg:p-4 rounded-xl sm:rounded-2xl bg-[#F8F7FF] border border-[#D6CFFF]/40 text-[11px] sm:text-xs">
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">Order ID</span>
              <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm break-all">{displayOrderId}</span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">Payment</span>
              <span className="font-semibold text-gray-900 inline-flex items-center gap-1">
                {isCod ? <Banknote className="w-3.5 h-3.5 text-amber-600" /> : <CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
                {isCod ? 'Cash on Delivery' : 'Prepaid (Online)'}
              </span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">Status</span>
              <span className={`font-semibold inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider ${
                order?.isPaid 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : isCod 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {order?.isPaid ? 'Paid' : isCod ? 'Pay on Delivery' : 'Confirmed'}
              </span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">Estimated Delivery</span>
              <span className="font-semibold text-gray-900 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#7464B8]" />
                {order?.shipmentTracking?.estimatedDelivery || '2-4 Business Days'}
              </span>
            </div>
          </div>

          {/* Ordered Items Breakdown */}
          {orderItems.length > 0 && (
            <div className="border border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 bg-white space-y-2 sm:space-y-2.5 lg:space-y-3">
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#17151F] flex items-center justify-between">
                <span>Items in your Order ({orderItems.length})</span>
                <span className="text-[10px] sm:text-[11px] text-gray-400 font-normal">Express Insured Delivery</span>
              </h3>
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="py-2 sm:py-2.5 lg:py-3 flex items-center gap-2.5 sm:gap-3.5 text-xs">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-cover rounded-lg sm:rounded-xl border border-[#D6CFFF]/40 shrink-0 bg-gray-50"
                      />
                    ) : (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl border border-[#D6CFFF]/40 flex items-center justify-center bg-[#F8F7FF] shrink-0">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-[11.5px] sm:text-xs">{item.name}</p>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                        {item.sku && <span>SKU: {item.sku}</span>}
                        {item.size && <span>Size: {item.size}</span>}
                        <span>Qty: {item.quantity}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                      <p className="text-[9.5px] sm:text-[10px] text-gray-400">₹{(item.price || 0).toLocaleString('en-IN')} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Two-Column: Price Summary & Shipping Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 lg:gap-4">
            {/* Price Breakdown */}
            <div className="p-3 sm:p-3.5 lg:p-4 rounded-xl sm:rounded-2xl bg-[#FAF9FF] border border-[#D6CFFF]/30 text-xs space-y-1.5 sm:space-y-2 lg:space-y-2.5">
              <h4 className="font-bold text-[#17151F] uppercase tracking-wider text-[10.5px] sm:text-[11px]">Price Summary</h4>
              <div className="flex justify-between text-gray-600 text-[11px] sm:text-xs">
                <span>Items Subtotal</span>
                <span>₹{(order?.itemsPrice || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[11px] sm:text-xs">
                <span>Shipping Fee</span>
                <span className={order?.shippingPrice === 0 ? 'text-emerald-600 font-semibold' : ''}>
                  {order?.shippingPrice === 0 ? 'FREE' : `₹${order?.shippingPrice || 0}`}
                </span>
              </div>
              {isCod && (
                <div className="flex justify-between text-gray-600 text-[11px] sm:text-xs">
                  <span>COD Handling Fee</span>
                  <span>₹{order?.codFee || 15}</span>
                </div>
              )}
              {order?.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium text-[11px] sm:text-xs">
                  <span>Coupon Discount</span>
                  <span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {order?.oceanPointsUsed > 0 && (
                <div className="flex justify-between text-purple-700 font-medium text-[11px] sm:text-xs">
                  <span>Zivana Points Applied</span>
                  <span>-₹{order.oceanPointsUsed.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-1.5 sm:pt-2 border-t border-gray-200 flex justify-between font-bold text-xs sm:text-sm text-gray-900">
                <span>Total Payable</span>
                <span>₹{(order?.totalPrice || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-3 sm:p-3.5 lg:p-4 rounded-xl sm:rounded-2xl bg-[#FAF9FF] border border-[#D6CFFF]/30 text-xs space-y-1 sm:space-y-1.5 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#17151F] uppercase tracking-wider text-[10.5px] sm:text-[11px] mb-1.5 sm:mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#7464B8]" />
                  <span>Delivery Address</span>
                </h4>
                {order?.shippingAddress ? (
                  <div className="text-gray-600 space-y-0.5 leading-snug text-[11px] sm:text-xs">
                    <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    {order.shippingAddress.landmark && (
                      <p className="text-gray-500 italic text-[10px] sm:text-[11px]">Landmark: {order.shippingAddress.landmark}</p>
                    )}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                    <p className="text-gray-500 pt-0.5">Phone: {order.shippingAddress.phone}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-[11px]">Address details confirmed on order record.</p>
                )}
              </div>

              {/* 7-Day Guarantee reminder */}
              <div className="pt-1.5 sm:pt-2 border-t border-gray-200/70 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-gray-500 mt-2 sm:mt-0">
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#7464B8] shrink-0" />
                <span>Protected by 7-Day Hassle-Free Return Policy</span>
              </div>
            </div>
          </div>

          {/* Ocean Points Award Banner */}
          {oceanPoints > 0 && (
            <div className="p-3 sm:p-3.5 lg:p-4 rounded-xl sm:rounded-2xl bg-[#17151F] text-white flex items-center justify-between gap-2.5 sm:gap-3 text-[11px] sm:text-xs shadow-sm">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D6CFFF] shrink-0" />
                <span>
                  You earned <strong className="text-[#D6CFFF]">{oceanPoints} Zivana Points</strong> on this order.
                </span>
              </div>
              <span className="text-[9.5px] sm:text-[10px] text-gray-300 uppercase tracking-widest hidden sm:inline">Zivana Club Loyalty</span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            <Link
              to="/account"
              className="flex-1 h-11 sm:h-12 lg:h-auto lg:py-3.5 bg-[#17151F] text-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider rounded-xl sm:rounded-2xl hover:bg-[#2A2635] shadow-sm lg:shadow-md inline-flex items-center justify-center gap-2 transition-all"
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D6CFFF]" />
              <span>View Order in Account</span>
            </Link>

            <Link
              to="/shop"
              className="flex-1 h-11 sm:h-12 lg:h-auto lg:py-3.5 bg-[#FAF9FF] text-gray-900 border border-[#D6CFFF]/60 text-[11px] sm:text-xs font-semibold uppercase tracking-wider rounded-xl sm:rounded-2xl hover:bg-[#F2EFFE] inline-flex items-center justify-center gap-2 transition-all"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
