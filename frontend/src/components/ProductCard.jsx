import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product, onQuickView }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const inWishlist = isInWishlist(product._id || product.id);
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
  const hoverImage = product.images && product.images.length > 1 ? product.images[1] : mainImage;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size';
    addToCart(product, 1, defaultSize);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col rounded-2xl sm:rounded-3xl bg-white p-2.5 sm:p-3 shadow-sm hover:shadow-card-hover border border-[#D6CFFF]/40 hover:border-[#7464B8]/60 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden bg-[#F3EFFF] mb-3">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered ? hoverImage : mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-all duration-700"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isBestseller && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-[#17151F] text-[#E8E3FF] border border-[#D6CFFF]/40 shadow-sm">
              Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-emerald-700 text-white shadow-sm">
              New
            </span>
          )}
          {product.discount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-rose-600 text-white shadow-sm">
              {product.discount}% Off
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Toggle Wishlist"
          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-[#17151F] hover:scale-110 active:scale-95 transition-all shadow-md"
        >
          <motion.div
            animate={inWishlist ? { scale: [1, 1.35, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                inWishlist ? 'fill-rose-500 text-rose-500' : 'text-gray-700'
              }`}
            />
          </motion.div>
        </button>

        {/* Quick Action Overlay (Appears on Hover on Desktop) */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-20 hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleQuickViewClick}
            className="flex-1 py-2 px-3 bg-white/90 backdrop-blur-md text-[#17151F] rounded-xl text-xs font-semibold hover:bg-white transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>

          <button
            onClick={handleAddToCart}
            className="flex-1 py-2 px-3 bg-[#17151F] text-white rounded-xl text-xs font-semibold hover:bg-[#2A2635] transition-colors shadow-md flex items-center justify-center gap-1.5 btn-shine"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D6CFFF]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between px-1">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span className="uppercase tracking-wider text-[10px] font-medium text-[#7464B8]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-[10px]">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating || 4.8}</span>
              <span className="text-gray-400 font-normal">({product.numReviews || 12})</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/products/${product.slug}`} className="block group-hover:text-[#7464B8] transition-colors">
            <h3 className="font-serif text-sm sm:text-base font-normal text-[#17151F] line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Mobile Quick Add */}
        <div className="mt-2 pt-2 border-t border-[#D6CFFF]/30 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-semibold text-sm sm:text-base text-[#17151F]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[11px] text-gray-400 line-through font-normal">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Mobile Direct Add Button */}
          <button
            onClick={handleAddToCart}
            className="lg:hidden p-1.5 bg-[#17151F] text-white rounded-lg shadow active:scale-95 transition-transform"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D6CFFF]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
