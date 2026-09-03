import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CheckoutPage() {
  const {
    cartItems,
    subtotal,
    shippingPrice,
    appliedCoupon,
    couponDiscount,
    redeemOceanPoints,
    setRedeemOceanPoints,
    isEligibleForPointsRedemption,
    pointsDiscount,
    total,
    potentialPointsEarned,
    clearCart,
  } = useCart();

  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isNewAddressMode, setIsNewAddressMode] = useState(false);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    house: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    landmark: '',
  });

  // Shipping Method
  const [deliverySpeed, setDeliverySpeed] = useState('express'); // 'express' or 'vip'

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' (UPI, Cards, NetBanking) or 'cod'
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shop');
      return;
    }

    const loadAddresses = async () => {
      if (isAuthenticated) {
        try {
          const res = await api.get('/auth/addresses');
          if (res.data?.success && res.data.data.length > 0) {
            setSavedAddresses(res.data.data);
            const defaultAddr = res.data.data.find((a) => a.isDefault) || res.data.data[0];
            setSelectedAddressId(defaultAddr._id);
          } else {
            setIsNewAddressMode(true);
          }
        } catch (e) {
          setIsNewAddressMode(true);
        }
      } else {
        setIsNewAddressMode(true);
      }
    };

    loadAddresses();
  }, [isAuthenticated, cartItems.length, navigate]);

  const handleAddressSubmit = async () => {
    let finalAddress;

    if (!isNewAddressMode && selectedAddressId) {
      finalAddress = savedAddresses.find((a) => a._id === selectedAddressId);
    } else {
      if (!addressForm.fullName || !addressForm.phone || !addressForm.house || !addressForm.street || !addressForm.city || !addressForm.pincode) {
        addToast('Please fill out all required address fields', 'error');
        return;
      }
      finalAddress = addressForm;
      if (isAuthenticated) {
        try {
          const res = await api.post('/auth/addresses', addressForm);
          if (res.data?.success) {
            setSavedAddresses((prev) => [res.data.data, ...prev]);
            setSelectedAddressId(res.data.data._id);
          }
        } catch (e) {
          console.error('Error saving address:', e);
        }
      }
    }

    setCurrentStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    let finalAddress;

    if (!isNewAddressMode && selectedAddressId) {
      finalAddress = savedAddresses.find((a) => a._id === selectedAddressId);
    } else {
      finalAddress = addressForm;
    }

    try {
      // 1. Create Order on Backend
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
        })),
        shippingAddress: finalAddress,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
        couponCode: appliedCoupon?.code || '',
        redeemOceanPoints: redeemOceanPoints,
      };

      const orderRes = await api.post('/orders', orderPayload);
      if (!orderRes.data?.success) {
        throw new Error(orderRes.data?.message || 'Order creation failed');
      }

      const createdOrder = orderRes.data.data;

      // 2. If Razorpay / Online Payment: Initiate Razorpay Verification Architecture
      if (paymentMethod === 'razorpay') {
        const rzpRes = await api.post('/payments/razorpay-order', { orderId: createdOrder._id });
        if (rzpRes.data?.success) {
          // Interactive Simulated Razorpay Verification
          const verifyRes = await api.post('/payments/verify', {
            orderId: createdOrder._id,
            razorpay_order_id: rzpRes.data.data.razorpayOrderId,
            razorpay_payment_id: `pay_${Date.now()}`,
            razorpay_signature: 'simulated_success',
          });

          if (verifyRes.data?.success) {
            clearCart();
            addToast('Payment verified successfully!', 'success');
            navigate(`/order-success?orderId=${createdOrder._id}`);
            return;
          }
        }
      }

      // COD or standard direct order
      clearCart();
      addToast('Order placed successfully!', 'success');
      navigate(`/order-success?orderId=${createdOrder._id}`);
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Payment processing failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#7464B8]">
            Secure Indian Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#17151F] mt-1">
            CONFIRM YOUR HEIRLOOM
          </h1>
        </div>

        {/* Steps Progress Header */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-[#7464B8] -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />

            {[
              { num: 1, label: 'Address', icon: MapPin },
              { num: 2, label: 'Delivery', icon: Truck },
              { num: 3, label: 'Payment', icon: CreditCard },
            ].map((s) => {
              const Icon = s.icon;
              const isCompleted = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                      isCompleted || isCurrent
                        ? 'bg-[#17151F] text-[#D6CFFF] border-2 border-[#D6CFFF]'
                        : 'bg-white text-gray-400 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[11px] font-semibold mt-2 uppercase tracking-wider ${
                    isCurrent ? 'text-[#17151F]' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Checkout Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Flow Steps */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: ADDRESS */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D6CFFF]/60 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h3 className="font-serif text-xl font-medium text-gray-900">
                    1. Shipping & Delivery Address
                  </h3>
                  {savedAddresses.length > 0 && (
                    <button
                      onClick={() => setIsNewAddressMode(!isNewAddressMode)}
                      className="text-xs font-bold text-[#7464B8] hover:underline"
                    >
                      {isNewAddressMode ? 'Use Saved Address' : '+ Add New Address'}
                    </button>
                  )}
                </div>

                {/* Saved Addresses List */}
                {!isNewAddressMode && savedAddresses.length > 0 ? (
                  <div className="space-y-3">
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr._id}
                        className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedAddressId === addr._id
                            ? 'border-[#17151F] bg-[#F3EFFF]/50 shadow-sm'
                            : 'border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)}
                          className="mt-1 accent-[#17151F]"
                        />
                        <div className="text-xs space-y-0.5">
                          <p className="font-bold text-gray-900 text-sm">{addr.fullName}</p>
                          <p className="text-gray-600">{addr.house}, {addr.street}</p>
                          <p className="text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-gray-500 font-medium mt-1">Mobile: {addr.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  /* New Address Form */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        placeholder="e.g. Riya Sharma"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Flat / House No. / Building *</label>
                      <input
                        type="text"
                        value={addressForm.house}
                        onChange={(e) => setAddressForm({ ...addressForm, house: e.target.value })}
                        placeholder="e.g. Flat 402, Lotus Grand"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Street Address & Area *</label>
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        placeholder="e.g. Koramangala 4th Block"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">City *</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="e.g. Bengaluru"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">State *</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="e.g. Karnataka"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Pincode *</label>
                      <input
                        type="text"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        placeholder="e.g. 560034"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={addressForm.landmark}
                        onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                        placeholder="e.g. Opposite Starbucks"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddressSubmit}
                  className="w-full py-3.5 bg-[#17151F] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#2A2635] shadow-lg flex items-center justify-center gap-2 btn-shine"
                >
                  <span>Continue to Delivery Options</span>
                  <ArrowRight className="w-4 h-4 text-[#D6CFFF]" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: DELIVERY OPTIONS */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D6CFFF]/60 shadow-sm space-y-6"
              >
                <h3 className="font-serif text-xl font-medium text-gray-900 pb-4 border-b border-gray-100">
                  2. Select Delivery Method
                </h3>

                <div className="space-y-3 text-xs">
                  <label
                    className={`flex items-start justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      deliverySpeed === 'express'
                        ? 'border-[#17151F] bg-[#F3EFFF]/50 shadow-sm'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-3">
                      <input
                        type="radio"
                        name="deliverySpeed"
                        checked={deliverySpeed === 'express'}
                        onChange={() => setDeliverySpeed('express')}
                        className="mt-0.5 accent-[#17151F]"
                      />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Complimentary Express Delivery</p>
                        <p className="text-gray-500 mt-0.5">BlueDart Luxury Courier &bull; 2-4 Business Days</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3.5 bg-gray-100 rounded-2xl text-xs font-bold uppercase tracking-wider text-gray-700"
                  >
                    &larr; Back to Address
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 py-3.5 bg-[#17151F] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#2A2635] btn-shine"
                  >
                    Continue to Payment &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PAYMENT METHOD */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D6CFFF]/60 shadow-sm space-y-6"
              >
                <h3 className="font-serif text-xl font-medium text-gray-900 pb-4 border-b border-gray-100">
                  3. Select Payment Mode
                </h3>

                <div className="space-y-3 text-xs">
                  {/* Razorpay Online */}
                  <label
                    className={`flex items-start justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-[#17151F] bg-[#F3EFFF]/50 shadow-sm'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="mt-0.5 accent-[#17151F]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm">Online Payment via Razorpay</p>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#D6CFFF] text-[#17151F]">
                            RECOMMENDED
                          </span>
                        </div>
                        <p className="text-gray-500 mt-0.5">UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking</p>
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-start justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#17151F] bg-[#F3EFFF]/50 shadow-sm'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-0.5 accent-[#17151F]"
                      />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Cash on Delivery (COD)</p>
                        <p className="text-gray-500 mt-0.5">Pay in cash or UPI QR code at your doorstep upon delivery.</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-emerald-700" />
                  <span>256-Bit Encrypted Bank-Grade Checkout. Razorpay Verified.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-3.5 bg-gray-100 rounded-2xl text-xs font-bold uppercase tracking-wider text-gray-700"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 py-4 bg-[#17151F] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#2A2635] shadow-xl flex items-center justify-center gap-2 btn-shine"
                  >
                    {isProcessing ? (
                      <span>Processing Order...</span>
                    ) : (
                      <>
                        <span>Complete Order &bull; ₹{total.toLocaleString('en-IN')}</span>
                        <CheckCircle2 className="w-4 h-4 text-[#D6CFFF]" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Sticky Order Summary */}
          <div className="lg:col-span-5 rounded-3xl bg-white p-6 sm:p-7 border border-[#D6CFFF]/60 shadow-sm space-y-5 sticky top-24">
            <h3 className="font-serif text-lg font-medium text-gray-900 pb-3 border-b border-gray-100">
              Order Summary ({cartItems.length} items)
            </h3>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-50">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.size}`} className="pt-2 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-14 rounded-xl object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-gray-400 text-[10px]">Qty: {item.quantity} &bull; {item.size}</p>
                  </div>
                  <span className="font-bold text-xs text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {pointsDiscount > 0 && (
                <div className="flex justify-between text-[#7464B8] font-medium">
                  <span>Ocean Points Reward</span>
                  <span>-₹{pointsDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Express Shipping</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>

              <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Grand Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Loyalty Points Earning Badge */}
            <div className="p-3 rounded-2xl bg-[#F3EFFF] border border-[#D6CFFF] flex items-center gap-2.5 text-xs text-[#17151F]">
              <Sparkles className="w-4 h-4 text-[#7464B8] shrink-0" />
              <span>You will earn <strong>{potentialPointsEarned} Ocean Points</strong> (₹{potentialPointsEarned} value) on this order!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
