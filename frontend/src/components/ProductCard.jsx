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
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : (product.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80');
  const hoverImage = product.images && product.images.length > 1 ? product.images[1] : mainImage;
  const imageSrc = isHovered ? hoverImage : mainImage;

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

  const effectiveDiscount = (product.discount && product.discount > 0)
    ? product.discount
    : (product.originalPrice && product.originalPrice > product.price)
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col rounded-2xl sm:rounded-3xl lg:rounded-2xl bg-white p-2.5 sm:p-3 lg:p-2.5 shadow-sm hover:shadow-card-hover border border-[#D6CFFF]/40 hover:border-[#7464B8]/60 transition-all duration-300 h-full justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[4/5] rounded-xl sm:rounded-2xl lg:rounded-xl overflow-hidden bg-[#F3EFFF] mb-2 sm:mb-3">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={imageSrc}
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
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isAntiTarnish && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold tracking-wider uppercase bg-white/90 backdrop-blur-md text-[#7464B8] border border-[#D6CFFF]/60 shadow-sm flex items-center gap-0.5 sm:gap-1">
              <Sparkles className="w-2.5 h-2.5 fill-current shrink-0" />
              <span className="truncate">Anti-Tarnish</span>
            </span>
          )}
          {product.isBestseller && !product.isAntiTarnish && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold tracking-wider uppercase bg-[#17151F] text-[#E8E3FF] border border-[#D6CFFF]/40 shadow-sm">
              Bestseller
            </span>
          )}
          {product.isNewArrival && !product.isBestseller && !product.isAntiTarnish && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold tracking-wider uppercase bg-emerald-700 text-white shadow-sm">
              New
            </span>
          )}
          {effectiveDiscount > 0 && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold tracking-wider uppercase bg-rose-600 text-white shadow-sm">
              {effectiveDiscount}% Off
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Toggle Wishlist"
          className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-[#17151F] hover:scale-110 active:scale-95 transition-all shadow-md"
        >
          <motion.div
            animate={inWishlist ? { scale: [1, 1.35, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 ${
                inWishlist ? 'fill-rose-500 text-rose-500' : 'text-gray-700'
              }`}
            />
          </motion.div>
        </button>

        {/* Quick Action Overlay (Appears on Hover on Desktop) */}
        <div className="absolute inset-x-1.5 bottom-1.5 sm:inset-x-2 sm:bottom-2 z-20 hidden lg:flex items-center gap-1 sm:gap-1.5 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleQuickViewClick}
            title="Quick View"
            className="flex-1 py-1.5 px-1 bg-white/95 backdrop-blur-md text-[#17151F] rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-white transition-colors shadow-md flex items-center justify-center gap-1"
          >
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="truncate">Quick View</span>
          </button>

          <button
            onClick={handleAddToCart}
            title="Add to Cart"
            className="flex-1 py-1.5 px-1 bg-[#17151F] text-white rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-[#2A2635] transition-colors shadow-md flex items-center justify-center gap-1 btn-shine"
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D6CFFF]" />
            <span className="truncate">Add</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between px-0.5 sm:px-1">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 mb-1">
            <span className="uppercase tracking-wider text-[9px] sm:text-[10px] font-medium text-[#7464B8] truncate max-w-[90px]">
              {product.category}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 font-semibold text-[9.5px] sm:text-[10px] shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              <span>{product.rating || 4.8}</span>
              <span className="text-gray-400 font-normal text-[8.5px] sm:text-[9px]">({product.numReviews || 12})</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/products/${product.slug}`} className="block group-hover:text-[#7464B8] transition-colors">
            <h3 className="font-serif text-xs sm:text-base font-normal text-[#17151F] line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Mobile Quick Add */}
        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-[#D6CFFF]/30 flex items-center justify-between">
          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
            <span className="font-semibold text-xs sm:text-base text-[#17151F]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-[11px] text-gray-400 line-through font-normal">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {effectiveDiscount > 0 && (
              <span className="text-[9px] sm:text-[10px] font-bold text-rose-600">
                {effectiveDiscount}% OFF
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
