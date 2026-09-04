import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Plus,
  Minus,
  CheckCircle2,
  MessageSquarePlus,
  Flame,
  Lock,
} from 'lucide-react';
import ProductGallery from '../components/ProductGallery';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState('Free Size');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState('description');

  // Review Form Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const res = await api.get(`/products/slug/${slug}`);
        if (res.data?.success) {
          const prod = res.data.data.product;
          setProduct(prod);
          setReviews(res.data.data.reviews || []);
          setRelatedProducts(res.data.data.relatedProducts || []);
          if (prod.sizes && prod.sizes.length > 0) {
            setSelectedSize(prod.sizes[0]);
          }
        }
      } catch (e) {
        console.error('Error fetching product:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#FAF9FF]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-[#D6CFFF] border-t-[#17151F] animate-spin" />
          <span className="text-xs font-serif tracking-widest text-[#7464B8] uppercase">Loading Piece...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="font-serif text-2xl font-light text-[#17151F]">Piece Not Found</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6">This jewellery piece might be discontinued or moved.</p>
        <Link to="/shop" className="px-6 py-3 bg-[#17151F] text-white rounded-2xl text-xs font-bold uppercase tracking-wider">
          Return to Showroom
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id || product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please sign in to leave a verified review', 'info');
      navigate('/account');
      return;
    }
    if (!reviewComment.trim()) {
      addToast('Please provide a comment for your review', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      if (res.data?.success) {
        addToast('Your review has been published!', 'success');
        setShowReviewModal(false);
        setReviewComment('');
        setReviewTitle('');
        // Refresh reviews
        const updatedReviews = await api.get(`/reviews/product/${product._id}`);
        if (updatedReviews.data?.success) {
          setReviews(updatedReviews.data.data);
        }
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const accordions = [
    {
      id: 'description',
      title: 'Design & Craftsmanship Narrative',
      content: product.description,
    },
    {
      id: 'specifications',
      title: 'Specifications & Dimensions',
      content: (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">Core Metal</span>
            <span className="font-semibold text-gray-900">{product.material}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">Finish Coating</span>
            <span className="font-semibold text-gray-900">{product.finish}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">Water Resistance</span>
            <span className="font-semibold text-emerald-700">100% Waterproof & Sweatproof</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">Hypoallergenic</span>
            <span className="font-semibold text-gray-900">Lead, Nickel & Cadmium Free</span>
          </div>
        </div>
      ),
    },
    {
      id: 'care',
      title: 'Anti-Tarnish Care Guide',
      content: (
        <p className="text-xs text-gray-600 font-light leading-relaxed">
          Thanks to our 18K Gold PVD nano-molecular plating, your Ocean Jewel piece is completely safe from showers, swimming, and workout sweat. To maintain its sparkling luster for decades, gently wipe with a soft microfiber cloth and store in the provided velvet pouch when not in use.
        </p>
      ),
    },
    {
      id: 'shipping',
      title: 'Indian Express Shipping & Easy Returns',
      content: (
        <div className="space-y-2 text-xs text-gray-600 font-light leading-relaxed">
          <p>• <strong>Free Express Shipping:</strong> Orders above ₹999 enjoy complimentary delivery in 2-4 business days.</p>
          <p>• <strong>Dispatched within 24 Hours:</strong> Hand-packed in luxury tamper-proof satin gift boxes.</p>
          <p>• <strong>7-Day Replacement Policy:</strong> Hassle-free exchanges in the rare event of sizing issues or transit defects.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9FF] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 uppercase tracking-wider font-medium">
          <Link to="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link to={`/${product.gender}`} className="hover:text-black capitalize">{product.gender}</Link>
          <span>/</span>
          <Link to={`/${product.gender}/${product.category.toLowerCase().replace(/ /g, '-')}`} className="hover:text-black">{product.category}</Link>
          <span>/</span>
          <span className="text-[#17151F] font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* PDP Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Multi-Image High-Res Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Right Column: Information & Checkout Actions */}
          <div className="lg:col-span-5">

            {/* ============================================================ */}
            {/* 1. MOBILE & TABLET VIEW: ULTRA-PREMIUM LUXURY PDP SECTION    */}
            {/* ============================================================ */}
            <div className="block lg:hidden space-y-4 sm:space-y-5">
              <div>
                {/* Category & Bestseller Pill */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7464B8]/10 border border-[#7464B8]/20 text-[10px] font-bold uppercase tracking-widest text-[#7464B8]">
                    <span>{product.category}</span>
                    <span className="text-[#7464B8]/40">&bull;</span>
                    <span>{product.gender}</span>
                  </span>
                  {product.isBestseller && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                      <Flame className="w-3 h-3 text-amber-500 fill-current" />
                      <span>Bestseller</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#17151F] leading-snug tracking-tight">
                  {product.name}
                </h1>

                {/* Rating & Review Header */}
                <div className="flex items-center gap-2.5 mt-2 text-xs">
                  <div className="inline-flex items-center gap-1 text-amber-500 font-bold bg-amber-50/90 border border-amber-200/70 px-2 py-0.5 rounded-lg">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#17151F] font-semibold">{product.rating || 4.9}</span>
                  </div>
                  <span className="text-gray-300">&bull;</span>
                  <button
                    type="button"
                    onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-[11px] text-gray-500 hover:text-[#7464B8] font-medium underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    {reviews.length || product.numReviews || 24} Verified Client Reviews
                  </button>
                </div>
              </div>

              {/* Luxury Pricing Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white via-[#FCFBFF] to-[#F7F4FF] border border-[#E3DCFF] shadow-[0_4px_20px_rgba(116,100,184,0.06)] space-y-2.5">
                {(() => {
                  const effectiveDiscount = (product.discount && product.discount > 0)
                    ? product.discount
                    : (product.originalPrice && product.originalPrice > product.price)
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0;

                  return (
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-price text-3xl sm:text-4xl font-bold text-[#17151F] tracking-tight">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="font-price text-base sm:text-lg text-gray-400 line-through font-normal">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      {effectiveDiscount > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
                          {effectiveDiscount}% OFF
                        </span>
                      )}
                    </div>
                  );
                })()}

                <div className="pt-2 border-t border-[#EDE7FA] flex items-center justify-between text-[11px] text-gray-500">
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    Free Express Indian Shipping
                  </span>
                  <span className="text-[10px] text-gray-400 font-light">Taxes Included</span>
                </div>
              </div>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900 uppercase tracking-wider">
                      Select Size / Dimension:
                    </span>
                    <span className="text-[#7464B8] font-semibold text-[11px]">
                      Standard Indian Sizing
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          selectedSize === s
                            ? 'border-2 border-[#17151F] bg-[#17151F] text-white shadow-md'
                            : 'border border-[#D6CFFF]/70 bg-white text-gray-800 hover:border-[#7464B8]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E3DCFF] shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Quantity:</span>
                <div className="flex items-center gap-3 bg-[#FAF8FF] border border-[#D6CFFF]/60 px-3 py-1 rounded-xl shadow-inner">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-gray-600 hover:text-black p-1 active:scale-90 transition-transform"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center text-[#17151F]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="text-gray-600 hover:text-black p-1 active:scale-90 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="space-y-2.5 pt-1">
                <div className="flex gap-2.5 sm:gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 sm:py-4 text-white rounded-xl sm:rounded-2xl text-xs font-bold uppercase tracking-widest active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 btn-shine transition-all ${
                      addedSuccess ? 'bg-emerald-700' : 'bg-[#17151F] hover:bg-[#2A2635]'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>Product Added to Bag ✓</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#D6CFFF]" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    aria-label="Wishlist"
                    className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl border flex items-center justify-center shadow-sm transition-all active:scale-95 shrink-0 ${
                      inWishlist
                        ? 'bg-rose-50 border-rose-200 text-rose-500'
                        : 'bg-white border-[#D6CFFF]/60 text-gray-700 hover:border-black'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#7464B8] via-[#5946A3] to-[#17151F] text-white rounded-xl sm:rounded-2xl text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-[#D6CFFF]" />
                  <span>Buy Now with Express Checkout</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[10.5px] text-gray-400 font-light pt-0.5">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Instant UPI, Cards &amp; Cash on Delivery Available</span>
                </div>
              </div>

              {/* Anti-Tarnish Guarantee Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-white via-[#FCFBFF] to-[#F8F5FF] border border-[#E4DDFF] shadow-sm flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#17151F] to-[#2E283F] text-[#D6CFFF] flex items-center justify-center shrink-0 shadow-xs border border-[#D6CFFF]/25">
                  <ShieldCheck className="w-5 h-5 text-[#D6CFFF]" />
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#17151F]">Lifetime Anti-Tarnish Guarantee</h4>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Certified
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px] mt-0.5 font-light leading-relaxed">
                    18K PVD coated on hypoallergenic surgical steel. 100% waterproof, sweatproof, and guaranteed never to fade or green.
                  </p>
                </div>
              </div>

              {/* Information Accordions */}
              <div className="space-y-2 pt-2 border-t border-[#D6CFFF]/40">
                {accordions.map((acc) => {
                  const isOpen = activeAccordion === acc.id;
                  return (
                    <div key={acc.id} className="rounded-xl sm:rounded-2xl bg-white border border-[#D6CFFF]/40 overflow-hidden shadow-2xs">
                      <button
                        onClick={() => setActiveAccordion(isOpen ? '' : acc.id)}
                        className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-[#7464B8] transition-colors"
                      >
                        <span>{acc.title}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 border-t border-gray-100 text-xs text-gray-600 leading-relaxed font-light"
                          >
                            {acc.content}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ============================================================ */}
            {/* 2. DESKTOP VIEW (lg:): 100% UNTOUCHED ORIGINAL RIGHT COLUMN  */}
            {/* ============================================================ */}
            <div className="hidden lg:block space-y-6">
              <div>
                {/* Category & Tag */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#7464B8]">
                    {product.category} &bull; {product.gender}
                  </span>
                  {product.isBestseller && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#17151F] text-[#E8E3FF]">
                      Bestseller
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#17151F] leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Review Header */}
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span>{product.rating || 4.9}</span>
                  </div>
                  <span className="text-gray-400">&bull;</span>
                  <span className="text-gray-600 font-medium underline cursor-pointer" onClick={() => {
                    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    {reviews.length || product.numReviews || 24} Verified Client Reviews
                  </span>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-4 rounded-2xl bg-white border border-[#D6CFFF]/40 shadow-sm space-y-1">
                {(() => {
                  const effectiveDiscount = (product.discount && product.discount > 0)
                    ? product.discount
                    : (product.originalPrice && product.originalPrice > product.price)
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0;

                  return (
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-price text-3xl sm:text-4xl font-bold text-[#17151F] tracking-tight">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="font-price text-base sm:text-lg text-gray-400 line-through font-normal">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      {effectiveDiscount > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
                          {effectiveDiscount}% OFF
                        </span>
                      )}
                    </div>
                  );
                })()}
                <p className="text-[11px] text-gray-500 font-light">
                  Inclusive of all taxes. Free express Indian shipping on this piece.
                </p>
              </div>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-gray-900 uppercase tracking-wider">Select Size / Dimension:</span>
                    <span className="text-[#7464B8] font-semibold">Standard Indian Sizing</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                          selectedSize === s
                            ? 'border-[#17151F] bg-[#17151F] text-white shadow-md'
                            : 'border-[#D6CFFF]/60 bg-white text-gray-800 hover:border-black'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Quantity:</span>
                <div className="flex items-center gap-3 bg-white border border-[#D6CFFF]/60 px-3 py-1.5 rounded-2xl shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-gray-600 hover:text-black p-1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="text-gray-600 hover:text-black p-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-4 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 btn-shine transition-all ${
                      addedSuccess ? 'bg-emerald-700' : 'bg-[#17151F] hover:bg-[#2A2635]'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>Product Added to Bag ✓</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#D6CFFF]" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    aria-label="Wishlist"
                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-sm transition-all ${
                      inWishlist
                        ? 'bg-rose-50 border-rose-200 text-rose-500'
                        : 'bg-white border-[#D6CFFF]/60 text-gray-700 hover:border-black'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 bg-gradient-to-r from-[#7464B8] to-[#17151F] text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-[#D6CFFF]" />
                  <span>Buy Now with Express Checkout</span>
                </button>
              </div>

              {/* Anti-Tarnish Guarantee Card */}
              <div className="p-4 rounded-2xl glass-card bg-white border border-[#D6CFFF]/60 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#17151F] text-[#D6CFFF] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-[#17151F]">Lifetime Anti-Tarnish Guarantee</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    18K PVD coated. 100% waterproof, sweatproof, and skin-friendly.
                  </p>
                </div>
              </div>

              {/* Information Accordions */}
              <div className="space-y-2 pt-2 border-t border-[#D6CFFF]/40">
                {accordions.map((acc) => {
                  const isOpen = activeAccordion === acc.id;
                  return (
                    <div key={acc.id} className="rounded-2xl bg-white border border-[#D6CFFF]/40 overflow-hidden shadow-sm">
                      <button
                        onClick={() => setActiveAccordion(isOpen ? '' : acc.id)}
                        className="w-full p-4 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-[#7464B8] transition-colors"
                      >
                        <span>{acc.title}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-4 pb-4 pt-1 border-t border-gray-100 text-xs text-gray-600 leading-relaxed font-light"
                          >
                            {acc.content}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Customer Reviews & Testimonials Section */}
        <div id="reviews-section" className="mt-24 pt-12 border-t border-[#D6CFFF]/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7464B8]">Patron Feedback</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#17151F] mt-1">
                Client Reviews &amp; Highlights ({reviews.length + (product.testimonial?.reviewText ? 1 : 0)})
              </h3>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#17151F] text-white rounded-2xl text-xs font-semibold uppercase tracking-wider hover:bg-[#2A2635] shadow-md btn-shine"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#D6CFFF]" />
              <span>Write a Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Admin Seeded / Featured Testimonial (if present) */}
            {product.testimonial && product.testimonial.reviewText && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-[#FCFBFF] to-[#F7F4FF] border border-[#7464B8]/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const tRating = product.testimonial.rating || 5;
                      return (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= tRating ? 'fill-current' : 'text-gray-300'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-semibold text-[#7464B8] uppercase tracking-wider bg-[#F3EFFF] px-2.5 py-0.5 rounded-full border border-[#D6CFFF]/60">
                    {product.testimonial.reviewBadge || 'Featured Review'}
                  </span>
                </div>

                <h4 className="font-semibold text-xs text-gray-900">
                  {product.testimonial.reviewBadge || 'Editorial Highlight'}
                </h4>
                <p className="text-xs text-gray-600 font-light leading-relaxed italic">
                  "{product.testimonial.reviewText}"
                </p>

                <div className="pt-3 border-t border-[#EDE7FA] flex items-center justify-between text-[11px]">
                  <span className="font-bold text-gray-800">
                    {product.testimonial.reviewerName}
                    {product.testimonial.reviewerLocation ? (
                      <span className="font-normal text-gray-500"> &bull; {product.testimonial.reviewerLocation}</span>
                    ) : null}
                  </span>
                  <span className="text-gray-400 text-[10px] font-medium">
                    Patron Spotlight
                  </span>
                </div>
              </div>
            )}

            {/* Client Reviews */}
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev._id} className="p-6 rounded-3xl bg-white border border-[#D6CFFF]/40 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h4 className="font-semibold text-xs text-gray-900">{rev.title}</h4>
                  <p className="text-xs text-gray-600 font-light leading-relaxed italic">
                    "{rev.comment}"
                  </p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-gray-800">{rev.userName}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Buyer
                    </span>
                  </div>
                </div>
              ))
            ) : !product.testimonial?.reviewText ? (
              <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-[#D6CFFF]/40 p-6">
                <p className="text-xs text-gray-500">Be the first verified patron to review this masterpiece!</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-[#D6CFFF]/40">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7464B8]">
                Complementary Pieces
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#17151F] mt-1">
                YOU MAY ALSO ADORE
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#FAF9FF] p-6 sm:p-8 shadow-2xl border border-[#D6CFFF]/60 z-10 space-y-4"
            >
              <h3 className="font-serif text-xl font-medium text-gray-900">
                Review: {product.name}
              </h3>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                    Your Rating:
                  </label>
                  <div className="flex gap-2 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${s <= reviewRating ? 'fill-current' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
                    Review Headline:
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Breathtaking finish and packaging!"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7464B8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
                    Your Detailed Review:
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with craftsmanship, anti-tarnish quality, and fit..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7464B8]"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-3 bg-gray-100 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 py-3 bg-[#17151F] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#2A2635] btn-shine"
                  >
                    {submittingReview ? 'Publishing...' : 'Publish Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
