import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('ocean_wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error('Failed parsing saved wishlist:', e);
      }
    }
  }, []);

  const saveWishlist = (items) => {
    setWishlist(items);
    localStorage.setItem('ocean_wishlist', JSON.stringify(items));
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.some((item) => (item._id || item.id) === (product._id || product.id));
    if (exists) {
      const updated = wishlist.filter((item) => (item._id || item.id) !== (product._id || product.id));
      saveWishlist(updated);
      addToast(`Removed ${product.name} from your Wishlist`, 'info');
    } else {
      const updated = [...wishlist, product];
      saveWishlist(updated);
      addToast(`Saved ${product.name} to your Wishlist ❤️`, 'success');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item.id) === productId);
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter((item) => (item._id || item.id) !== productId);
    saveWishlist(updated);
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
