import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, Sparkles, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import api from '../services/api';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Launch luxury celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D6CFFF', '#17151F', '#F4E8C1', '#B6ABF4'],
    });

    if (orderId) {
      api.get(`/orders/${orderId}`).then((res) => {
        if (res.data?.success) {
          setOrder(res.data.data);
        }
      }).catch(console.error);
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#FAF9FF] py-16 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl bg-white p-8 sm:p-12 border border-[#D6CFFF]/60 shadow-2xl text-center space-y-6"
        >
          {/* Animated Success Badge */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#D6CFFF] to-[#E8E3FF] text-[#17151F] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(214,207,255,0.7)]">
            <CheckCircle2 className="w-10 h-10 text-[#17151F]" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#7464B8]">
              Order Placed Successfully
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#17151F] mt-2">
              THANK YOU FOR YOUR PATRONAGE
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light mt-2 max-w-md mx-auto">
              Your heirloom jewellery order has been confirmed and transferred to our master craftsmen for 12-point inspection.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="p-5 rounded-2xl bg-[#F8F7FF] border border-[#D6CFFF]/40 text-xs space-y-3 text-left">
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-500">Order Reference</span>
              <span className="font-bold text-gray-900 font-mono text-sm">
                {order?.orderId || 'OJ-26-CONFIRMED'}
              </span>
            </div>

            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-500">Estimated Delivery</span>
              <span className="font-semibold text-gray-900">
                {order?.shipmentTracking?.estimatedDelivery || '2-4 Business Days'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount Paid</span>
              <span className="font-bold text-gray-900 text-sm">
                ₹{(order?.totalPrice || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Ocean Points Award Card */}
          <div className="p-4 rounded-2xl bg-[#17151F] text-white flex items-center justify-center gap-3 text-xs shadow-lg">
            <Sparkles className="w-5 h-5 text-[#D6CFFF]" />
            <span>
              Congratulations! You earned <strong className="text-[#D6CFFF]">{order?.oceanPointsEarned || 15} Ocean Points</strong> on this order.
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              to={order ? `/orders/${order._id}` : '/account'}
              className="flex-1 py-3.5 bg-[#17151F] text-white text-xs font-semibold uppercase tracking-wider rounded-2xl hover:bg-[#2A2635] shadow-md flex items-center justify-center gap-2 btn-shine"
            >
              <Package className="w-4 h-4 text-[#D6CFFF]" />
              <span>Track Live Delivery</span>
            </Link>

            <Link
              to="/shop"
              className="flex-1 py-3.5 bg-gray-100 text-gray-800 text-xs font-semibold uppercase tracking-wider rounded-2xl hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
