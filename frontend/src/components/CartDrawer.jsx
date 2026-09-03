import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer() {
  const {
    cartItems,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingPrice,
    freeShippingRemaining,
    freeShippingProgress,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponDiscount,
    redeemOceanPoints,
    setRedeemOceanPoints,
    isEligibleForPointsRedemption,
    pointsDiscount,
    total,
    potentialPointsEarned,
  } = useCart();

  const { user, isAuthenticated } = useAuth();
  const [couponInput, setCouponInput] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setLoadingCoupon(true);
    await applyCoupon(couponInput.trim());
    setLoadingCoupon(false);
    setCouponInput('');
  };

  const handleCheckoutClick = () => {
    setIsDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#FAF9FF] z-50 shadow-2xl flex flex-col justify-between border-l border-[#D6CFFF]/50"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#D6CFFF]/30 bg-white/70 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#7464B8]" />
                  <h3 className="font-serif text-lg font-light text-[#17151F]">
                    Your Shopping Bag ({cartItems.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="mt-4 pt-3 border-t border-[#D6CFFF]/20">
                {freeShippingRemaining > 0 ? (
                  <p className="text-xs text-gray-600 font-medium">
                    Add <strong className="text-[#17151F]">₹{freeShippingRemaining}</strong> more for <strong>Free Express Shipping</strong>
                  </p>
                ) : (
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Congratulations! You unlocked Free Express Delivery 🎉
                  </p>
                )}
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    className="h-full bg-gradient-to-r from-[#D6CFFF] to-[#7464B8] rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#D6CFFF]/30 text-2xl flex items-center justify-center mx-auto">
                    💎
                  </div>
                  <h4 className="font-serif text-lg font-light text-[#17151F]">Your bag is empty</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Explore our anti-tarnish fine jewellery collections and elevate your everyday style.
                  </p>
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      navigate('/shop');
                    }}
                    className="mt-2 px-6 py-2.5 bg-[#17151F] text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#2A2635]"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item._id}-${item.size}`}
                    className="flex gap-3 p-3 rounded-2xl bg-white border border-[#D6CFFF]/40 shadow-sm"
                  >
                    {/* Item Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-24 rounded-xl object-cover bg-gray-50 shrink-0"
                    />

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <Link
                            to={`/products/${item.slug}`}
                            onClick={() => setIsDrawerOpen(false)}
                            className="text-xs font-semibold text-[#17151F] hover:text-[#7464B8] line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item._id, item.size)}
                            className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                          Size: {item.size}
                        </p>
                      </div>

                      {/* Price & Quantity Adjuster */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-xs text-[#17151F]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>

                        <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1, item.size)}
                            className="text-gray-600 hover:text-black"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1, item.size)}
                            className="text-gray-600 hover:text-black"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Drawer Footer */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-[#D6CFFF]/30 bg-white/90 backdrop-blur-md space-y-4">
                {/* Promo Code Box */}
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Code '{appliedCoupon.code}' (-₹{couponDiscount})</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-emerald-700 hover:text-rose-600 text-[11px] font-bold underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Discount Code (e.g. WELCOME10)"
                        className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8] uppercase"
                      />
                      <button
                        type="submit"
                        disabled={loadingCoupon}
                        className="px-4 py-2 bg-[#17151F] text-white text-xs font-semibold rounded-xl hover:bg-[#2A2635]"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>

                {/* Ocean Points Loyalty Redemption Option */}
                {isAuthenticated && (user?.oceanPoints || 0) >= 500 && (
                  <div className="p-2.5 rounded-xl bg-[#F3EFFF] border border-[#D6CFFF] text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#7464B8]" />
                      <div>
                        <span className="font-semibold text-gray-900">500 Ocean Points Available</span>
                        <p className="text-[10px] text-gray-500">Redeem for flat ₹500 discount</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={redeemOceanPoints}
                        onChange={(e) => setRedeemOceanPoints(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7464B8]"></div>
                    </label>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Coupon Discount</span>
                      <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-[#7464B8] font-medium">
                      <span>Ocean Points Redeemed</span>
                      <span>-₹{pointsDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingPrice === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingPrice}`}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>

                  <p className="text-[10px] text-gray-400 text-center pt-1">
                    You will earn ~{potentialPointsEarned} Ocean Points from this purchase
                  </p>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 bg-[#17151F] text-white text-xs font-semibold uppercase tracking-widest rounded-2xl hover:bg-[#2A2635] shadow-xl flex items-center justify-center gap-2 btn-shine"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#D6CFFF]" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
