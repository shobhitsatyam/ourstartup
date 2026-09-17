import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Package,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  MapPin,
  CreditCard,
  Banknote,
  RotateCcw,
  Clock,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { launchRazorpayCheckout } from '../services/razorpay';
import { launchCashfreeCheckout } from '../services/cashfree';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { addToast } = useToast();

  // Handles both Cashfree parameter (order_id) and internal parameter (orderId)
  const rawOrderId =
    searchParams.get('order_id') ||
    searchParams.get('orderId') ||
    searchParams.get('orderID');

  const [order, setOrder] = useState(null);
  // Status: 'VERIFYING' | 'SUCCESS' | 'FAILED' | 'PENDING'
  const [status, setStatus] = useState(rawOrderId ? 'VERIFYING' : 'FAILED');
  const [errorMessage, setErrorMessage] = useState('');
  const [pollCount, setPollCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const verificationAttempted = useRef(false);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.55 },
        colors: ['#D6CFFF', '#17151F', '#F4E8C1', '#B6ABF4', '#E8E3FF'],
      });
    } catch (e) {}
  };

  const verifyAndLoadOrder = useCallback(
    async (isPolling = false) => {
      if (!rawOrderId) {
        setStatus('FAILED');
        setErrorMessage('No order reference found in the request.');
        return;
      }

      if (!isPolling) {
        setStatus('VERIFYING');
      }

      try {
        // 1. Fetch internal order record directly from backend
        const orderRes = await api.get(`/orders/${rawOrderId}`).catch(() => null);
        if (orderRes?.data?.success) {
          const directOrder = orderRes.data.data;
          setOrder(directOrder);
          if (directOrder.isPaid || directOrder.paymentMethod === 'cod') {
            setStatus('SUCCESS');
            clearCart();
            triggerConfetti();
            return;
          }
        }

        // 2. If it's a legacy Cashfree order, attempt Cashfree verification
        if (orderRes?.data?.data?.paymentMethod === 'cashfree' || (!orderRes && String(rawOrderId).startsWith('cf_'))) {
          const verifyRes = await api.post('/payment/cashfree/verify', {
            order_id: rawOrderId,
          });

          const vData = verifyRes.data;

          if (vData?.success && vData?.status === 'SUCCESS') {
            setOrder(vData.data);
            setStatus('SUCCESS');
            clearCart();
            triggerConfetti();
            return;
          }

          if (vData?.status === 'PENDING') {
            setOrder(vData.data);
            setStatus('PENDING');
            setErrorMessage(vData.message || 'Payment is currently being cleared by your bank.');
            return;
          }

          if (['FAILED', 'USER_DROPPED', 'CANCELLED'].includes(vData?.status)) {
            setOrder(vData.data);
            setStatus('FAILED');
            setErrorMessage(vData.message || 'Payment attempt was cancelled or declined.');
            return;
          }
        }

        if (orderRes?.data?.data) {
          const ord = orderRes.data.data;
          if (ord.isPaid || ord.paymentMethod === 'cod') {
            setStatus('SUCCESS');
            clearCart();
            triggerConfetti();
          } else {
            setStatus('PENDING');
            setErrorMessage('Awaiting payment clearance or confirmation.');
          }
        }
      } catch (err) {
        console.error('[OrderSuccess] Verification error:', err);
        const serverMsg = err.response?.data?.message || err.message;
        setStatus('FAILED');
        setErrorMessage(serverMsg || 'Failed to verify payment status.');
      }
    },
    [rawOrderId, clearCart]
  );

  useEffect(() => {
    if (!verificationAttempted.current && rawOrderId) {
      verificationAttempted.current = true;
      verifyAndLoadOrder();
    }
  }, [rawOrderId, verifyAndLoadOrder]);

  // Automated polling for PENDING state (up to 4 times, every 3.5s)
  useEffect(() => {
    let timer;
    if (status === 'PENDING' && pollCount < 4) {
      timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        verifyAndLoadOrder(true);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [status, pollCount, verifyAndLoadOrder]);

  // Retry payment directly via Razorpay or Cashfree
  const handleRetryPayment = async () => {
    const targetOrderId = order?._id || rawOrderId;
    if (!targetOrderId) {
      addToast('Order reference missing for retry.', 'error');
      return;
    }

    setIsRetrying(true);
    try {
      if (order?.paymentMethod === 'razorpay' || !order?.paymentMethod || order?.paymentMethod !== 'cashfree') {
        const res = await api.post('/payment/razorpay/create-order', {
          orderId: targetOrderId,
        });

        if (res.data?.success && res.data?.data) {
          const rData = res.data.data;
          await launchRazorpayCheckout({
            key: rData.keyId,
            amount: rData.amount,
            currency: rData.currency || 'INR',
            order_id: rData.razorpayOrderId,
            name: 'Zivana Jewels',
            description: `Order #${order?.orderId || targetOrderId}`,
            prefill: rData.prefill || {},
            notes: { orderId: order?.orderId || targetOrderId },
            onSuccess: async (response) => {
              try {
                addToast('Verifying payment clearance with bank...', 'info');
                const verifyRes = await api.post('/payment/razorpay/verify', {
                  orderId: targetOrderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });

                if (verifyRes.data?.success) {
                  setOrder(verifyRes.data.data);
                  setStatus('SUCCESS');
                  clearCart();
                  triggerConfetti();
                  addToast('Payment verified successfully!', 'success');
                } else {
                  throw new Error(verifyRes.data?.message || 'Payment verification failed.');
                }
              } catch (vErr) {
                console.error('[OrderSuccess] Verification Error:', vErr);
                addToast(vErr.response?.data?.message || vErr.message || 'Payment verification failed.', 'error');
              } finally {
                setIsRetrying(false);
              }
            },
            onDismiss: () => {
              setIsRetrying(false);
              addToast('Payment retry was cancelled.', 'info');
            },
            onError: (err) => {
              setIsRetrying(false);
              addToast(err?.description || 'Payment failed. Please try again.', 'error');
            },
          });
          return;
        }
      }

      // Fallback for legacy Cashfree orders
      const res = await api.post('/payment/cashfree/create-order', {
        orderId: targetOrderId,
      });

      if (res.data?.success && res.data?.data?.payment_session_id) {
        addToast('Reopening secure checkout portal...', 'info');
        await launchCashfreeCheckout(res.data.data.payment_session_id, '_self');
      } else {
        throw new Error(res.data?.message || 'Failed to initialize retry session.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to retry payment.';
      addToast(msg, 'error');
      setIsRetrying(false);
    }
  };

  const isCod = order?.paymentMethod?.toLowerCase() === 'cod';
  const displayOrderId = order?.orderId || rawOrderId || 'OJ-CONFIRMED';
  const orderItems = order?.orderItems || [];
  const oceanPoints = order?.oceanPointsEarned ?? Math.floor((order?.totalPrice || 0) / 100);

  return (
    <div className="min-h-screen bg-[#FAF9FF] pt-4 pb-28 sm:pt-6 sm:pb-32 lg:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* STATE 1: VERIFYING IN PROGRESS */}
        {status === 'VERIFYING' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl sm:rounded-3xl bg-white p-7 sm:p-12 border border-[#D6CFFF]/60 shadow-lg text-center space-y-5"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F3EFFF] text-[#7464B8] flex items-center justify-center mx-auto ring-4 ring-[#D6CFFF]/40 shadow-inner">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-[#7464B8]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#7464B8]">
                {order?.paymentMethod === 'cashfree' ? 'Cashfree PG Verification' : 'Payment Verification'}
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-light text-[#17151F]">
                SECURING YOUR HEIRLOOM
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-light max-w-md mx-auto">
                {order?.paymentMethod === 'cashfree'
                  ? 'Verifying bank clearance and payment receipt with Cashfree servers. Please do not close this window.'
                  : 'Verifying bank clearance and payment receipt with secure payment gateway. Please do not close this window.'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Reference Order: <strong className="font-mono text-gray-900">{displayOrderId}</strong>
              </span>
            </div>
          </motion.div>
        )}

        {/* STATE 2: FAILED / CANCELLED */}
        {status === 'FAILED' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-10 border border-red-200/80 shadow-xl space-y-6 text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto ring-4 ring-red-100">
              <XCircle className="w-9 h-9 sm:w-11 sm:h-11 text-red-600" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-red-600">
                Payment Incomplete
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#17151F]">
                TRANSACTION NOT COMPLETED
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-light max-w-md mx-auto">
                {errorMessage ||
                  'The payment session was either cancelled or could not be verified by the bank.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/60 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-[10px] uppercase tracking-wider">Order Reference</span>
                <span className="font-mono font-bold text-gray-800">{displayOrderId}</span>
              </div>
              {order?.totalPrice && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-[10px] uppercase tracking-wider">Payable Total</span>
                  <span className="font-mono font-bold text-gray-900">
                    ₹{Number(order.totalPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                Your order is safely preserved in our system. You may retry payment immediately using UPI, card, or net banking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleRetryPayment}
                disabled={isRetrying}
                className="flex-1 py-3.5 px-4 bg-[#17151F] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#2A2635] shadow-md inline-flex items-center justify-center gap-2 btn-shine disabled:opacity-60 cursor-pointer"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D6CFFF]" />
                    <span>Preparing Payment...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 text-[#D6CFFF]" />
                    <span>Retry Payment</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="py-3.5 px-4 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 inline-flex items-center justify-center"
              >
                Change Payment Mode
              </button>
            </div>
          </motion.div>
        )}

        {/* STATE 3: PENDING CLEARANCE */}
        {status === 'PENDING' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-10 border border-amber-200 shadow-xl space-y-6 text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-4 ring-amber-100">
              <Clock className="w-9 h-9 sm:w-11 sm:h-11 text-amber-600" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
                Awaiting Clearance
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#17151F]">
                PAYMENT PROCESSING
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-light max-w-md mx-auto">
                {errorMessage ||
                  'Your payment is currently being cleared by your bank. We are awaiting final confirmation.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Automatic Status Polling Active...</p>
              <p className="text-[11px] text-amber-800">
                Checking payment confirmation attempt {pollCount + 1} of 5. Once confirmed, your order updates automatically.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => verifyAndLoadOrder(false)}
                className="flex-1 py-3.5 px-4 bg-[#17151F] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#2A2635] shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#D6CFFF]" />
                <span>Check Status Now</span>
              </button>
              <Link
                to="/account"
                className="py-3.5 px-4 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 inline-flex items-center justify-center"
              >
                Go to My Orders
              </Link>
            </div>
          </motion.div>
        )}

        {/* STATE 4: VERIFIED SUCCESS CONFIRMATION */}
        {status === 'SUCCESS' && (
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
                  Your order has been verified and placed successfully. It is being packed with our signature tamper-evident satin presentation packaging.
                </p>
              </div>
            </div>

            {/* Key Reference Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 sm:p-3.5 lg:p-4 rounded-xl sm:rounded-2xl bg-[#F8F7FF] border border-[#D6CFFF]/40 text-[11px] sm:text-xs">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">
                  Order ID
                </span>
                <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm break-all">
                  {displayOrderId}
                </span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">
                  Payment
                </span>
                <span className="font-semibold text-gray-900 inline-flex items-center gap-1">
                  {isCod ? (
                    <Banknote className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  {isCod ? 'Cash on Delivery' : (order?.paymentMethod === 'razorpay' ? 'Prepaid (Razorpay)' : 'Prepaid Online')}
                </span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">
                  Status
                </span>
                <span
                  className={`font-semibold inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider ${
                    order?.isPaid
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isCod
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {order?.isPaid ? 'Paid & Confirmed' : isCod ? 'Pay on Delivery' : 'Confirmed'}
                </span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">
                  Estimated Delivery
                </span>
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
                  <span className="text-[10px] sm:text-[11px] text-gray-400 font-normal">
                    Express Insured Delivery
                  </span>
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
                        <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[9.5px] sm:text-[10px] text-gray-400">
                          ₹{(item.price || 0).toLocaleString('en-IN')} each
                        </p>
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
                <h4 className="font-bold text-[#17151F] uppercase tracking-wider text-[10.5px] sm:text-[11px]">
                  Price Summary
                </h4>
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
                  <span>Total Paid</span>
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
                        <p className="text-gray-500 italic text-[10px] sm:text-[11px]">
                          Landmark: {order.shippingAddress.landmark}
                        </p>
                      )}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                        {order.shippingAddress.postalCode || order.shippingAddress.pincode}
                      </p>
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
                <span className="text-[9.5px] sm:text-[10px] text-gray-300 uppercase tracking-widest hidden sm:inline">
                  Zivana Club Loyalty
                </span>
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
        )}
      </div>
    </div>
  );
}
