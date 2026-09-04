import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size'
  );
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    onClose();
  };

  const effectiveDiscount = (product?.discount && product.discount > 0)
    ? product.discount
    : (product?.originalPrice && product.originalPrice > product.price)
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-3xl rounded-3xl bg-[#FAF9FF] p-6 sm:p-8 shadow-2xl border border-[#D6CFFF]/60 z-10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
              {/* Product Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F3EFFF] border border-[#D6CFFF]/40">
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#7464B8]">
                    {product.category}
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#17151F] leading-snug mt-1">
                    {product.name}
                  </h2>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-1 text-xs">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-700">{product.rating || 4.9}</span>
                    <span className="text-gray-400">({product.numReviews || 12} reviews)</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl font-semibold text-[#17151F]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {effectiveDiscount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-600 text-white">
                      {effectiveDiscount}% OFF
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 font-light leading-relaxed">
                  {product.shortDescription || product.description}
                </p>

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-700 block mb-1.5">
                      Select Dimension / Size:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            selectedSize === s
                              ? 'border-[#17151F] bg-[#17151F] text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 bg-[#17151F] text-white rounded-2xl text-xs font-semibold uppercase tracking-widest hover:bg-[#2A2635] shadow-lg flex items-center justify-center gap-2 btn-shine"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#D6CFFF]" />
                    <span>Add to Bag</span>
                  </button>

                  <Link
                    to={`/products/${product.slug}`}
                    onClick={onClose}
                    className="w-full py-2.5 text-center text-xs font-semibold text-[#7464B8] hover:text-[#17151F] flex items-center justify-center gap-1"
                  >
                    <span>View Complete Details & Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
