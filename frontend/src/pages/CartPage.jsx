import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingPrice,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponDiscount,
    redeemOceanPoints,
    setRedeemOceanPoints,
    pointsDiscount,
    total,
    potentialPointsEarned,
  } = useCart();

  const { user, isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  const handleApply = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    await applyCoupon(couponCode.trim());
    setCouponCode('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-[#FAF9FF]">
        <div className="w-16 h-16 rounded-full bg-[#D6CFFF]/30 flex items-center justify-center text-3xl mb-4">
          💎
        </div>
        <h2 className="font-serif text-3xl font-light text-[#17151F]">Your Bag is Empty</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6 max-w-sm">
          Discover our anti-tarnish Indian jewellery and timeless accessories.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3.5 bg-[#17151F] text-white rounded-2xl text-xs font-bold uppercase tracking-wider btn-shine"
        >
          Explore Showroom
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9FF] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#17151F] mb-8">
          SHOPPING BAG ({cartItems.length})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 rounded-3xl bg-white p-6 sm:p-8 border border-[#D6CFFF]/60 shadow-sm space-y-6">
            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.size}`} className="py-4 flex gap-4 sm:gap-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl object-cover bg-gray-50 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link to={`/products/${item.slug}`} className="font-semibold text-sm sm:text-base text-gray-900 hover:text-[#7464B8]">
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item._id, item.size)}
                          className="text-gray-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-xl">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1, item.size)}>
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1, item.size)}>
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>

                      <span className="font-bold text-sm sm:text-base text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Breakdown */}
          <div className="lg:col-span-4 rounded-3xl bg-white p-6 sm:p-8 border border-[#D6CFFF]/60 shadow-sm space-y-5 sticky top-24">
            <h3 className="font-serif text-xl font-medium text-gray-900 pb-3 border-b border-gray-100">
              Order Summary
            </h3>

            {/* Promo Code */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="font-semibold text-emerald-800">Code '{appliedCoupon.code}' (-₹{couponDiscount})</span>
                  <button onClick={removeCoupon} className="text-emerald-700 font-bold underline">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border rounded-xl uppercase"
                  />
                  <button type="submit" className="px-4 py-2 bg-[#17151F] text-white rounded-xl font-bold">
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-[#7464B8]">
                  <span>Points Redeemed</span>
                  <span>-₹{pointsDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-600 font-bold">{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Grand Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-[#17151F] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-[#2A2635] shadow-xl flex items-center justify-center gap-2 btn-shine"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#D6CFFF]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
