import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Tag, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function SmartCouponSuggestion({ className = '' }) {
  const { subtotal, appliedCoupon, applyCoupon, removeCoupon, couponDiscount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isApplying, setIsApplying] = useState(false);

  // Eligibility Check: Existing customers who have already completed orders must never see WELCOME10
  const isExistingCustomer = isAuthenticated && user && (user.isNewCustomer === false || (user.orderCount || 0) > 0);
  if (isExistingCustomer) {
    return null;
  }

  // WELCOME10 threshold is standardized to ₹999
  const threshold = 999;
  const isUnlocked = subtotal >= threshold;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / threshold) * 100));
  const isApplied = appliedCoupon?.code?.toUpperCase() === 'WELCOME10';

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await applyCoupon('WELCOME10');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className={`w-full overflow-hidden transition-all duration-300 ${className}`}>
      <AnimatePresence mode="wait">
        {/* STATE 1: WELCOME10 ALREADY APPLIED */}
        {isApplied ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-[#F3EFFF]/40 to-emerald-50 border border-emerald-300/80 shadow-2xs flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900 leading-tight">
                  🎉 WELCOME10 Applied — 10% OFF
                </p>
                <p className="text-[10.5px] text-emerald-700">
                  You saved ₹{couponDiscount?.toLocaleString('en-IN') || 0} on your first order!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-[11px] font-bold text-emerald-700 hover:text-rose-600 transition-colors underline shrink-0 px-1"
            >
              Remove
            </button>
          </motion.div>
        ) : isUnlocked ? (
          /* STATE 2: WELCOME10 UNLOCKED (Cart >= ₹999) — 1-Click Apply */
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FAF9FF] via-[#F3EFFF] to-[#EAE4FF] border border-[#D6CFFF] shadow-xs relative overflow-hidden"
          >
            {/* Subtle Luxury Sheen */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-white/40 rounded-full blur-lg pointer-events-none" />

            <div className="flex items-center justify-between gap-2.5 relative z-10">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#17151F] text-amber-300 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#7464B8] text-white">
                      First Order Perk
                    </span>
                    <span className="text-[10px] font-bold text-[#7464B8]">
                      Code: WELCOME10
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#17151F] mt-0.5">
                    🎉 WELCOME10 unlocked! Apply now and save 10%.
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying}
                className="px-3.5 py-2 bg-[#17151F] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-[#2A2635] active:scale-95 shadow-md flex items-center gap-1 shrink-0 btn-shine transition-all disabled:opacity-75"
              >
                {isApplying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Apply</span>
                    <ArrowRight className="w-3 h-3 text-[#D6CFFF]" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          /* STATE 3: PROGRESS TOWARDS WELCOME10 (Cart < ₹999) — Zomato-Style */
          <motion.div
            key="locked"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3 rounded-2xl bg-[#FAF9FF] border border-[#D6CFFF]/60 shadow-2xs space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#17151F] font-semibold">
                <Tag className="w-3.5 h-3.5 text-[#7464B8]" />
                <span>
                  Add <strong className="text-[#7464B8]">₹{remaining.toLocaleString('en-IN')}</strong> more to apply <strong className="font-mono text-[#17151F]">WELCOME10</strong>
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#7464B8] bg-[#F3EFFF] px-2 py-0.5 rounded-full border border-[#D6CFFF]/50">
                10% OFF
              </span>
            </div>

            {/* Luxury Dual-Tone Progress Bar */}
            <div className="w-full bg-[#EAE4FF] h-1.5 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#7464B8] via-[#8B7CCF] to-[#17151F] rounded-full shadow-2xs"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
