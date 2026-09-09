import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [redeemOceanPoints, setRedeemOceanPoints] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem('ocean_cart');
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed parsing cart data:', e);
      }
    }
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('ocean_cart', JSON.stringify(items));
  };

  const addToCart = (product, quantity = 1, size = 'Free Size') => {
    const productId = product._id || product.id;
    const existingIndex = cartItems.findIndex(
      (item) => (item.product || item._id) === productId && item.size === size
    );

    let updated;
    if (existingIndex > -1) {
      updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [
        ...cartItems,
        {
          product: productId,
          _id: productId,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images ? product.images[0] : product.image,
          quantity,
          size: size || 'Free Size',
          stock: product.stock || 20,
        },
      ];
    }

    saveCart(updated);
    addToast('Product added to bag ✓', 'success');
  };

  const updateQuantity = (productId, newQuantity, size = 'Free Size') => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    const updated = cartItems.map((item) => {
      if ((item.product || item._id) === productId && item.size === size) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    saveCart(updated);
  };

  const removeFromCart = (productId, size = 'Free Size') => {
    const updated = cartItems.filter(
      (item) => !((item.product || item._id) === productId && item.size === size)
    );
    saveCart(updated);
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
    setRedeemOceanPoints(false);
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/coupons/validate', {
        code,
        cartTotal: subtotal,
        email: user?.email,
        phone: user?.phone,
      });

      if (res.data?.success) {
        setAppliedCoupon(res.data.data);
        addToast(res.data.message || `Coupon '${code}' applied!`, 'success');
        return { success: true, data: res.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid or expired coupon code';
      addToast(message, 'error');
      return { success: false, message };
    }
  };

  // Auto-remove applied coupon if cart subtotal drops below minimum required amount
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minOrderAmount > 0 && subtotal > 0 && subtotal < appliedCoupon.minOrderAmount) {
      const couponName = appliedCoupon.code;
      const minReq = appliedCoupon.minOrderAmount;
      setAppliedCoupon(null);
      addToast(`Coupon '${couponName}' removed (requires minimum order of ₹${minReq})`, 'info');
    }
  }, [subtotal, appliedCoupon]);

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon removed', 'info');
  };

  const [storeSettings, setStoreSettings] = useState({
    freeShippingThreshold: 799,
    standardShippingFee: 99,
    codHandlingFee: 15,
  });

  const [hasCelebratedFreeShipping, setHasCelebratedFreeShipping] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('ocean_free_shipping_celebrated') === 'true';
  });

  useEffect(() => {
    api.get('/cms/store_settings')
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setStoreSettings((prev) => ({
            ...prev,
            freeShippingThreshold: Number(res.data.data.freeShippingThreshold) || 799,
            standardShippingFee: Number(res.data.data.standardShippingFee) || 99,
            codHandlingFee: Number(res.data.data.codHandlingFee) || 15,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Free shipping threshold: ₹799 (Configurable via Admin Store Settings)
  const freeShippingThreshold = storeSettings.freeShippingThreshold || 799;
  const standardShippingFee = storeSettings.standardShippingFee || 99;
  const shippingPrice = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardShippingFee;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Trigger celebration banner once per session when crossing ₹799
  useEffect(() => {
    if (subtotal >= freeShippingThreshold && !hasCelebratedFreeShipping && cartItems.length > 0) {
      setHasCelebratedFreeShipping(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ocean_free_shipping_celebrated', 'true');
      }
      addToast('🎉 Congratulations! You unlocked FREE Insured Express Shipping across India!', 'success');
    }
  }, [subtotal, freeShippingThreshold, hasCelebratedFreeShipping, cartItems.length]);

  // Coupon discount computation
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      const raw = (subtotal * appliedCoupon.discountAmount) / 100;
      couponDiscount = Math.min(raw, appliedCoupon.maxDiscountAmount || 5000);
    } else {
      couponDiscount = Math.min(appliedCoupon.discountAmount, subtotal);
    }
  }

  // Ocean Points discount (500 points = ₹500 discount)
  const isEligibleForPointsRedemption = (user?.oceanPoints || 0) >= 500 && (subtotal - couponDiscount) >= 500;
  const pointsDiscount = redeemOceanPoints && isEligibleForPointsRedemption ? 500 : 0;

  const total = Math.max(0, subtotal + shippingPrice - couponDiscount - pointsDiscount);
  const potentialPointsEarned = Math.floor(total / 100);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        shippingPrice,
        freeShippingThreshold,
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
