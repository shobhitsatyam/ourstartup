import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Tag, Check, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import { useWelcomeCoupon } from '../../context/CartContext';

export default function SmartCouponSuggestion({ variant = 'cart', className = '' }) {
  const {
    isNewCustomer,
    isUnlocked,
    minimumOrderValue,
    currentEligibleAmount,
    remainingAmount,
    discountPercent,
    discountAmount,
    couponApplied,
    rejectionReason,
    applyWelcomeCoupon,
    removeWelcomeCoupon,
  } = useWelcomeCoupon();

  const [isApplying, setIsApplying] = useState(false);

  // If customer is NOT new and has no coupon applied, do NOT suggest WELCOME10
  if (!isNewCustomer && !couponApplied) {
    return null;
  }

  // If customer somehow has coupon applied but is not eligible, show rejection error
  if (!isNewCustomer && couponApplied) {
    return (
      <div className={`p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 ${className}`}>
        <p className="font-semibold">This welcome offer is available only on your first order.</p>
        <button
          type="button"
          onClick={removeWelcomeCoupon}
          className="mt-1 text-[11px] font-bold text-amber-700 underline hover:text-amber-950"
        >
          Remove Coupon
        </button>
      </div>
    );
  }

  // Calculate dynamic progress towards the minimum order threshold
  const progress = minimumOrderValue > 0
    ? Math.min(100, Math.round((currentEligibleAmount / minimumOrderValue) * 100))
    : 100;

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await applyWelcomeCoupon();
    } finally {
      setIsApplying(false);
    }
  };

  /* ========================================================================= */
  /* VARIANT: CHECKOUT PAGE (Compact Layout)                                   */
  /* ========================================================================= */
  if (variant === 'checkout') {
    return (
      <div className={`w-full overflow-hidden transition-all duration-300 ${className}`}>
        <AnimatePresence mode="wait">
          {couponApplied ? (
            <motion.div
              key="checkout-applied"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <span className="font-bold text-emerald-900">✓ WELCOME10 applied</span>
                  <p className="text-[10.5px] text-emerald-700 font-medium">
                    You saved ₹{discountAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeWelcomeCoupon}
                className="text-[11px] font-bold text-emerald-700 hover:text-rose-600 underline shrink-0 px-1"
              >
                Remove
              </button>
            </motion.div>
          ) : isUnlocked ? (
            <motion.div
              key="checkout-unlocked"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-3 rounded-2xl bg-gradient-to-r from-[#FAF9FF] to-[#F3EFFF] border border-[#D6CFFF] shadow-2xs flex items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#17151F] text-amber-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div>
                  <div className="font-bold text-[#17151F]">WELCOME10</div>
                  <p className="text-[10.5px] text-[#7464B8] font-medium">
                    {discountPercent}% OFF on your first order
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying}
                className="px-3 py-1.5 bg-[#17151F] text-white rounded-xl text-[10.5px] font-bold uppercase tracking-wider hover:bg-[#2A2635] active:scale-95 shadow-xs flex items-center gap-1 shrink-0 btn-shine transition-all disabled:opacity-75"
              >
                {isApplying ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <span>APPLY WELCOME10</span>
                    <ArrowRight className="w-3 h-3 text-[#D6CFFF]" />
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="checkout-locked"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-3 rounded-2xl bg-[#FAF9FF] border border-[#D6CFFF]/60 shadow-2xs flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#7464B8] shrink-0" />
                <div>
                  <span className="font-bold text-[#17151F]">WELCOME10</span> &bull; {discountPercent}% OFF
                  <p className="text-[11px] text-gray-600 font-medium">
                    Add ₹{remainingAmount.toLocaleString('en-IN')} more to apply this coupon
                  </p>
                </div>
              </div>
              <Link
                to="/shop"
                className="px-2.5 py-1 bg-white border border-[#D6CFFF] text-[#17151F] rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#FAF9FF] shrink-0 transition-colors"
              >
                SHOP MORE
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ========================================================================= */
  /* VARIANT: CART DRAWER / MINI CART (Ultra-Compact Layout)                   */
  /* ========================================================================= */
  if (variant === 'drawer') {
    return (
      <div className={`w-full overflow-hidden transition-all duration-300 ${className}`}>
        <AnimatePresence mode="wait">
          {couponApplied ? (
            <motion.div
              key="drawer-applied"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-1.5 text-emerald-900 font-semibold truncate">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">✓ WELCOME10 applied (-₹{discountAmount.toLocaleString('en-IN')})</span>
              </div>
              <button
                type="button"
                onClick={removeWelcomeCoupon}
                className="text-[11px] font-bold text-emerald-700 hover:text-rose-600 underline shrink-0"
              >
                Remove
              </button>
            </motion.div>
          ) : isUnlocked ? (
            <motion.div
              key="drawer-unlocked"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#FAF9FF] to-[#F3EFFF] border border-[#D6CFFF] flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 text-xs truncate">
                <span className="text-sm">🎉</span>
                <div className="truncate">
                  <span className="font-bold text-[#17151F] truncate block">WELCOME10 unlocked</span>
                  <span className="text-[10px] text-[#7464B8] font-medium block">Get {discountPercent}% OFF on your first order</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying}
                className="px-3 py-1.5 bg-[#17151F] text-white rounded-lg text-[10.5px] font-bold uppercase tracking-wider hover:bg-[#2A2635] active:scale-95 shadow-xs shrink-0 flex items-center gap-1 btn-shine disabled:opacity-75"
              >
                {isApplying ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Apply</span>}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="drawer-locked"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-2.5 rounded-xl bg-[#FAF9FF] border border-[#D6CFFF]/60 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#17151F]">
                  <span className="text-xs">🎁</span>
                  <span>Get {discountPercent}% OFF</span>
                </div>
                <span className="text-[10px] font-bold text-[#7464B8]">
                  Add ₹{remainingAmount.toLocaleString('en-IN')} more
                </span>
              </div>
              <div className="w-full bg-[#EAE4FF] h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#7464B8] to-[#17151F] rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ========================================================================= */
  /* VARIANT: CART PAGE (Zomato-Style Featured Card)                           */
  /* ========================================================================= */
  return (
    <div className={`w-full overflow-hidden transition-all duration-300 ${className}`}>
      <AnimatePresence mode="wait">
        {/* STATE 1: APPLIED */}
        {couponApplied ? (
          <motion.div
            key="cart-applied"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-[#F3EFFF]/40 to-emerald-50 border border-emerald-300/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-950">✓ WELCOME10 applied</h4>
                <p className="text-xs text-emerald-800 font-medium">
                  You saved ₹{discountAmount.toLocaleString('en-IN')} on your first order!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeWelcomeCoupon}
              className="text-xs font-bold text-emerald-700 hover:text-rose-600 underline shrink-0 sm:self-center self-end px-1"
            >
              Remove
            </button>
          </motion.div>
        ) : isUnlocked ? (
          /* STATE 2: UNLOCKED — 1-Click Apply */
          <motion.div
            key="cart-unlocked"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF9FF] via-[#F3EFFF] to-[#EAE4FF] border border-[#D6CFFF] shadow-xs relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#17151F] text-amber-300 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#17151F]">🎉 WELCOME10 unlocked</h4>
                  <p className="text-xs text-[#7464B8] font-medium mt-0.5">
                    Get {discountPercent}% OFF on your first order
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#17151F] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#2A2635] active:scale-95 shadow-md flex items-center justify-center gap-1.5 shrink-0 btn-shine transition-all disabled:opacity-75"
              >
                {isApplying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>APPLY WELCOME10</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D6CFFF]" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          /* STATE 3: LOCKED — Zomato-Style Progress Bar & Shop More */
          <motion.div
            key="cart-locked"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#D6CFFF]/70 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-[#17151F] font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#7464B8]" />
                  <span>WELCOME10</span>
                </div>
                <p className="text-xs text-[#7464B8] font-medium mt-0.5">
                  Get {discountPercent}% OFF on your first order
                </p>
              </div>

              <span className="text-[11px] font-bold text-[#7464B8] bg-[#F3EFFF] px-2.5 py-1 rounded-full border border-[#D6CFFF]/60">
                First Order Only
              </span>
            </div>

            {/* Dynamic Remaining Amount Notice */}
            <div className="text-xs font-medium text-gray-700">
              Add <strong className="text-[#17151F] font-bold">₹{remainingAmount.toLocaleString('en-IN')}</strong> more to unlock this offer
            </div>

            {/* Luxury Animated Progress Bar */}
            <div className="w-full bg-[#EAE4FF] h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#7464B8] via-[#8B7CCF] to-[#17151F] rounded-full shadow-2xs"
              />
            </div>

            {/* Shop More Action */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-light">
                Min. Order ₹{minimumOrderValue.toLocaleString('en-IN')}
              </span>
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#17151F] hover:text-[#7464B8] transition-colors uppercase tracking-wider"
              >
                <span>SHOP MORE / ADD PRODUCTS</span>
                <ArrowRight className="w-3 h-3 text-[#7464B8]" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
