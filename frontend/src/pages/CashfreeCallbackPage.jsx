import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Package,
  Sparkles,
  AlertCircle,
  Loader2,
  CreditCard,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { launchCashfreeCheckout } from '../services/cashfree';

export default function CashfreeCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { addToast } = useToast();

  const rawOrderId = searchParams.get('order_id') || searchParams.get('orderId');

  // Verification status: 'VERIFYING' | 'SUCCESS' | 'FAILED' | 'PENDING'
  const [status, setStatus] = useState('VERIFYING');
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const verificationAttempted = useRef(false);

  const verifyPayment = useCallback(
    async (isPolling = false) => {
      if (!rawOrderId) {
        setStatus('FAILED');
        setErrorMessage('No order identifier was found in the return request.');
        return;
      }

      if (!isPolling) {
        setStatus('VERIFYING');
      }

      try {
        const res = await api.post('/payment/cashfree/verify', {
          order_id: rawOrderId,
        });

        const resData = res.data;
        if (resData?.success && resData?.status === 'SUCCESS') {
          setStatus('SUCCESS');
          setOrder(resData.data);
          clearCart();

          // Confetti celebration
          try {
            confetti({
              particleCount: 90,
              spread: 65,
              origin: { y: 0.55 },
              colors: ['#D6CFFF', '#17151F', '#F4E8C1', '#B6ABF4', '#E8E3FF'],
            });
          } catch (e) {}

          addToast('Payment verified successfully!', 'success');
        } else if (resData?.status === 'PENDING') {
          setStatus('PENDING');
          setOrder(resData.data);
          setErrorMessage(resData.message || 'Payment is currently pending bank confirmation.');
        } else {
          setStatus('FAILED');
          setOrder(resData.data);
          setErrorMessage(
            resData?.message || 'Payment attempt was not completed or was declined by the bank.'
          );
        }
      } catch (err) {
        console.error('Verification error:', err);
        const serverMsg = err.response?.data?.message || err.message;
        setStatus('FAILED');
        setErrorMessage(serverMsg || 'Failed to verify payment with Cashfree servers.');
      }
    },
    [rawOrderId, clearCart, addToast]
  );

  useEffect(() => {
    if (!verificationAttempted.current) {
      verificationAttempted.current = true;
      verifyPayment();
    }
  }, [verifyPayment]);

  // Auto-polling for PENDING state (up to 4 times, every 3.5s)
  useEffect(() => {
    let timer;
    if (status === 'PENDING' && pollCount < 4) {
      timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        verifyPayment(true);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [status, pollCount, verifyPayment]);

  // Retry payment directly via Cashfree Hosted Checkout
  const handleRetryPayment = async () => {
    const targetOrderId = order?._id || rawOrderId;
    if (!targetOrderId) {
      addToast('Order identifier missing for retry.', 'error');
      return;
    }

    setIsRetrying(true);
    try {
      const res = await api.post('/payment/cashfree/create-order', {
        orderId: targetOrderId,
      });

      if (res.data?.success && res.data?.data?.payment_session_id) {
        addToast('Reopening secure Cashfree payment portal...', 'info');
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

  const displayOrderId = order?.orderId || rawOrderId || 'OJ-HEIRLOOM';
  const displayAmount = order?.totalPrice ? `₹${Number(order.totalPrice).toLocaleString('en-IN')}` : '';

  return (
    <div className="min-h-[80vh] bg-[#FAF9FF] py-8 sm:py-12 lg:py-16 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-xl">
        {/* State 1: Verifying */}
        {status === 'VERIFYING' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white p-7 sm:p-10 border border-[#D6CFFF]/70 shadow-lg text-center space-y-5"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F3EFFF] text-[#7464B8] flex items-center justify-center mx-auto ring-4 ring-[#D6CFFF]/40 shadow-inner">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-[#7464B8]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#7464B8]">
                Cashfree PG Verification
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-light text-[#17151F]">
                SECURING YOUR HEIRLOOM
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-light max-w-md mx-auto">
                Verifying bank clearance and payment receipt with Cashfree servers. Please do not refresh.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Reference Order: <strong className="font-mono text-gray-900">{displayOrderId}</strong></span>
            </div>
          </motion.div>
        )}

        {/* State 2: Success */}
        {status === 'SUCCESS' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white p-7 sm:p-10 border border-[#D6CFFF]/80 shadow-xl space-y-6 text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#D6CFFF] to-[#E8E3FF] text-[#17151F] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(214,207,255,0.7)]">
              <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 text-[#17151F]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#7464B8]">
                Cashfree Payment Verified
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#17151F]">
                PAYMENT CONFIRMED
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-light max-w-md mx-auto">
                Your payment was received and verified successfully. Your heirloom piece is officially confirmed.
              </p>
            </div>

            {/* Receipt Details Card */}
            <div className="p-4 rounded-2xl bg-[#F8F7FF] border border-[#D6CFFF]/50 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                <span className="text-gray-500 uppercase tracking-wider text-[10px]">Order Reference</span>
                <span className="font-mono font-bold text-gray-900">{displayOrderId}</span>
              </div>
              {displayAmount && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                  <span className="text-gray-500 uppercase tracking-wider text-[10px]">Amount Paid</span>
                  <span className="font-bold text-gray-900 font-mono text-sm text-[#17151F]">{displayAmount}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                <span className="text-gray-500 uppercase tracking-wider text-[10px]">Payment Method</span>
                <span className="font-medium text-emerald-800 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  Prepaid via Cashfree
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 uppercase tracking-wider text-[10px]">Order Status</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  CONFIRMED &amp; PROCESSING
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to={`/order-success?orderId=${order?._id || displayOrderId}`}
                className="flex-1 py-3.5 px-4 bg-[#17151F] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#2A2635] shadow-md inline-flex items-center justify-center gap-2 btn-shine"
              >
                <span>View Confirmation Details</span>
                <ArrowRight className="w-4 h-4 text-[#D6CFFF]" />
              </Link>
              <Link
                to="/shop"
                className="py-3.5 px-4 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 inline-flex items-center justify-center"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        )}

        {/* State 3: Failed / Cancelled */}
        {status === 'FAILED' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white p-7 sm:p-10 border border-red-200/80 shadow-xl space-y-6 text-center"
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
                {errorMessage || 'The payment session was either cancelled or could not be verified by the bank.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/60 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-[10px] uppercase tracking-wider">Order ID</span>
                <span className="font-mono font-bold text-gray-800">{displayOrderId}</span>
              </div>
              {displayAmount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-[10px] uppercase tracking-wider">Payable Total</span>
                  <span className="font-mono font-bold text-gray-900">{displayAmount}</span>
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
                    <span>Retry Payment with Cashfree</span>
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

        {/* State 4: Pending */}
        {status === 'PENDING' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white p-7 sm:p-10 border border-amber-200 shadow-xl space-y-6 text-center"
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
                {errorMessage || 'Your payment is currently being cleared by your bank. We are awaiting final confirmation.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Automatic Status Polling Active...</p>
              <p className="text-[11px] text-amber-800">
                Checking Cashfree status attempt {pollCount + 1} of 5. Once confirmed, your order updates automatically.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => verifyPayment(false)}
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
      </div>
    </div>
  );
}
