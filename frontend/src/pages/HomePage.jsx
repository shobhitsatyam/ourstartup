import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Flame, ChevronLeft, ChevronRight, Gift, Copy, Check } from 'lucide-react';
import Hero from '../components/Hero';
import MobileSearchBar from '../components/MobileSearchBar';
import MobileCategoryStrip from '../components/MobileCategoryStrip';
import TrustBadgeSection from '../components/TrustBadgeSection';
import CategoryShowcase from '../components/CategoryShowcase';
import FestiveOfferBanner from '../components/promotions/FestiveOfferBanner';
import PermanentOffer from '../components/promotions/PermanentOffer';
import ProductGrid from '../components/ProductGrid';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import CustomerReviews from '../components/CustomerReviews';
import api from '../services/api';

export default function HomePage({ onOpenSearch }) {
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [womenBestsellers, setWomenBestsellers] = useState([]);
  const [menBestsellers, setMenBestsellers] = useState([]);
  const [mobileGender, setMobileGender] = useState('women');
  const [welcomeCopied, setWelcomeCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const categoryScrollRef = useRef(null);
  const [canScrollCatLeft, setCanScrollCatLeft] = useState(false);
  const [canScrollCatRight, setCanScrollCatRight] = useState(true);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await api.get('/products/curated/highlights');
        if (res.data?.success) {
          const allNew = res.data.data.newArrivals || [];
          const allBest = res.data.data.bestsellers || [];
          setNewArrivals(allNew);
          setBestsellers(allBest);

          const wBests = allBest.filter((p) => p.gender === 'women' || p.gender === 'unisex');
          const mBests = allBest.filter((p) => p.gender === 'men');
          setWomenBestsellers(wBests.length > 0 ? wBests : allBest);
          setMenBestsellers(mBests.length > 0 ? mBests : allBest);
        }
      } catch (e) {
        console.error('Failed to load highlights:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  // Helper to ensure exactly 12 products for 6 columns x 2 rows desktop showcase
  const get12Products = (items) => {
    if (!items || items.length === 0) return [];
    if (items.length >= 12) return items.slice(0, 12);
    const result = [];
    while (result.length < 12) {
      for (const item of items) {
        if (result.length >= 12) break;
        result.push(item);
      }
    }
    return result;
  };

  const shopByCategories = [
    { name: 'RINGS', gender: 'women', img: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80', link: '/women/rings' },
    { name: 'EARRINGS & CHANDBALIS', gender: 'women', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80', link: '/women/earrings' },
    { name: 'CUBAN & BYZANTINE CHAINS', gender: 'men', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80', link: '/men/chains' },
    { name: 'BRACELETS & CUFFS', gender: 'unisex', img: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80', link: '/women/bracelets-bangles' },
    { name: 'WATERPROOF ANKLETS', gender: 'women', img: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80', link: '/women/anklets' },
    { name: 'SAREE ACCESSORIES & PINS', gender: 'women', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80', link: '/women/saree-accessories' },
  ];

  const handleCategoryScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollCatLeft(scrollLeft > 10);
      setCanScrollCatRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = categoryScrollRef.current.clientWidth * 0.7;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-0">
      {/* 1. CINEMATIC HERO */}
      <Hero />

      {/* MOBILE-ONLY SEARCH BAR (INSPIRED BY REFERENCE, HIDDEN ON DESKTOP) */}
      <MobileSearchBar onOpenSearch={onOpenSearch} />

      {/* MOBILE-ONLY CATEGORY SHORTCUTS STRIP (WITH MEN/WOMEN TOGGLE, HIDDEN ON DESKTOP) */}
      <MobileCategoryStrip
        activeGender={mobileGender}
        onGenderChange={setMobileGender}
      />

      {/* 2. ANTI-TARNISH QUALITY USPs (ENGINEERED TO NEVER FADE) */}
      <TrustBadgeSection />

      {/* 3. NEW ARRIVALS (DESKTOP ONLY — REPLACES CATEGORY SHOWCASE IN SAME POSITION) */}
      <div className="hidden min-[1025px]:block">
        <section className="py-10 lg:py-14 bg-white border-b border-[#D6CFFF]/25">
          <div className="max-w-7xl xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-6 lg:mb-8 relative">
              <span className="text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-[0.35em] text-[#7464B8]">
                Freshly Handcrafted
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[30px] font-light text-[#17151F] mt-0.5 tracking-tight">
                NEW ARRIVALS
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 font-light mt-1">
                Discover what's newly designed at Ocean Jewel.
              </p>
              <div className="w-10 h-0.5 bg-[#D6CFFF] mx-auto mt-2" />

              <Link
                to="/new-arrivals"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#17151F] hover:text-[#7464B8] transition-colors group absolute right-0 bottom-0"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 6 COLUMNS x 2 ROWS = 12 PRODUCTS */}
            <ProductGrid
              products={get12Products(newArrivals)}
              loading={loading}
              onQuickView={(p) => setQuickViewProduct(p)}
              columns={6}
            />
          </div>
        </section>
      </div>

      {/* MOBILE & TABLET: 2-COLUMN BESTSELLERS SECTION (REPLACES CATEGORY SHOWCASE ON MOBILE/TABLET) */}
      <div className="block min-[1025px]:hidden">
        <section className="py-8 sm:py-12 bg-[#FAF9FF] border-t border-[#D6CFFF]/30">
          <div className="w-full px-3.5 sm:px-6 max-w-7xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#17151F] tracking-tight">
                Best seller
              </h2>
            </div>

            {/* Vertical 2-Column Product Grid (Exactly 8 Products: 4 Rows x 2 Columns) */}
            <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
              {(() => {
                const pool = mobileGender === 'men'
                  ? [...menBestsellers, ...bestsellers, ...newArrivals]
                  : [...womenBestsellers, ...bestsellers, ...newArrivals];
                const uniquePool = pool.filter(
                  (v, i, a) => a.findIndex((t) => (t._id || t.id) === (v._id || v.id)) === i
                );
                return uniquePool.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ));
              })()}
            </div>

            {/* View All Best Sellers CTA Button */}
            <div className="mt-7 text-center">
              <Link
                to="/bestsellers"
                className="inline-flex items-center gap-2 px-7 py-3 bg-[#17151F] text-white hover:bg-[#7464B8] rounded-xl text-xs font-semibold uppercase tracking-widest shadow-md transition-all duration-300 transform active:scale-95"
              >
                <span>VIEW ALL BEST SELLERS →</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* 4. OFFER BANNER */}
      {/* MOBILE & TABLET (0px - 1024px): 16:6 "10% OFF YOUR FIRST ORDER" BANNER */}
      <div className="block min-[1025px]:hidden">
        <section className="py-4 sm:py-6 bg-[#FAF9FF] relative overflow-hidden border-b border-[#D6CFFF]/30">
          <div className="w-full px-3.5 sm:px-6 max-w-7xl mx-auto">
            <div
              className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-[#D6CFFF]/60 aspect-[16/6] bg-gradient-to-br from-[#FFFFFF] via-[#F8F6FF] to-[#EDE8FF] flex items-center justify-center"
              style={{ aspectRatio: '16 / 6' }}
            >
              {/* Subtle ambient luxury glows */}
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#D6CFFF]/30 blur-[40px] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[#E8E3FF]/40 blur-[40px] pointer-events-none" />

              {/* Centered, Responsive Content within 16:6 Banner */}
              <div className="relative z-10 w-full h-full p-2 xs:p-2.5 sm:p-4 md:p-5 flex flex-col items-center justify-center text-center space-y-1 xs:space-y-1.5 sm:space-y-2.5">
                {/* Eyebrow Pill */}
                <div className="inline-flex items-center gap-1 px-2 xs:px-2.5 py-0.5 rounded-full bg-[#17151F]/5 border border-[#D6CFFF]/60 shadow-2xs">
                  <Gift className="w-2 xs:w-2.5 sm:w-3 h-2 xs:h-2.5 sm:h-3 text-[#7464B8]" />
                  <span className="text-[7px] xs:text-[8px] sm:text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#7464B8]">
                    A Little Extra, Just For You
                  </span>
                </div>

                {/* Main Heading */}
                <h2 className="font-serif text-[12px] xs:text-[14px] sm:text-xl md:text-2xl font-light text-[#17151F] tracking-tight leading-tight">
                  10% OFF YOUR FIRST ORDER
                </h2>

                {/* Subtitle */}
                <p className="text-[7.5px] xs:text-[8.5px] sm:text-xs text-gray-600 font-light max-w-xs sm:max-w-md mx-auto line-clamp-1">
                  Begin your Ocean Jewel journey with a little something extra.
                </p>

                {/* Action Row: Coupon Code Pill + SHOP NOW CTA */}
                <div className="pt-0.5 flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3">
                  {/* Copyable Coupon Box */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigator.clipboard.writeText('WELCOME10');
                      setWelcomeCopied(true);
                      setTimeout(() => setWelcomeCopied(false), 2200);
                    }}
                    className="px-2 xs:px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg bg-white border border-[#D6CFFF] shadow-2xs text-[7.5px] xs:text-[8.5px] sm:text-xs text-[#17151F] flex items-center gap-1 transition-all active:scale-95"
                    title="Click to copy coupon code"
                  >
                    <span className="text-[6.5px] xs:text-[7.5px] sm:text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                      USE CODE:
                    </span>
                    <span className="font-mono font-bold tracking-wider text-[#17151F]">
                      WELCOME10
                    </span>
                    {welcomeCopied ? (
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-2.5 h-2.5 text-gray-400 hover:text-[#7464B8]" />
                    )}
                    {welcomeCopied && (
                      <span className="text-[7px] text-emerald-600 font-medium hidden xs:inline">Copied!</span>
                    )}
                  </button>

                  {/* SHOP NOW Action Button */}
                  <Link
                    to="/shop"
                    className="px-2.5 xs:px-3 sm:px-4 py-1 sm:py-1.5 bg-[#17151F] text-white rounded-lg text-[7.5px] xs:text-[8.5px] sm:text-xs font-semibold tracking-wider uppercase hover:bg-[#2A2635] shadow-xs flex items-center gap-1 transition-all active:scale-95 btn-shine"
                  >
                    <span>SHOP NOW</span>
                    <ArrowRight className="w-2.5 xs:w-3 h-2.5 xs:h-3 text-[#D6CFFF]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* DESKTOP (1025px+): FESTIVE OFFER BANNER — 100% UNTOUCHED */}
      <div className="hidden min-[1025px]:block">
        <FestiveOfferBanner />
      </div>

      {/* 5. NEW ARRIVALS */}
      {/* MOBILE & TABLET: 2-COLUMN VERTICAL PRODUCT GRID (NO HORIZONTAL CAROUSEL) */}
      <div className="block min-[1025px]:hidden">
        <section className="py-8 sm:py-12 bg-white border-t border-[#D6CFFF]/25">
          <div className="w-full px-3.5 sm:px-6 max-w-7xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#17151F] tracking-tight">
                New arrival
              </h2>
            </div>

            {/* Vertical 2-Column Product Grid (Continues Downward Vertically) */}
            <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
              {newArrivals.slice(0, 6).map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/new-arrivals"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-white border border-[#17151F] text-[#17151F] hover:bg-[#17151F] hover:text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-300"
              >
                <span>VIEW ALL NEW PIECES →</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* 5. BESTSELLERS (DESKTOP ONLY — 8 COLUMNS x 2 ROWS = 16 PRODUCTS) */}
      <div className="hidden min-[1025px]:block">
        <section className="py-10 lg:py-14 bg-[#FAF9FF] border-t border-[#D6CFFF]/30">
          <div className="max-w-7xl xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-6 lg:mb-8 relative">
              <div className="flex items-center justify-center gap-1.5 text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-[0.35em] text-amber-600">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span>Patron Favorites</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[30px] font-light text-[#17151F] mt-0.5 tracking-tight">
                MOST LOVED BESTSELLERS
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 font-light mt-1">
                The most coveted pieces backed by 5-star verified reviews.
              </p>
              <div className="w-10 h-0.5 bg-[#D6CFFF] mx-auto mt-2" />

              <Link
                to="/bestsellers"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#17151F] hover:text-[#7464B8] transition-colors group absolute right-0 bottom-0"
              >
                <span>Explore All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 6 COLUMNS x 2 ROWS = 12 PRODUCTS */}
            <ProductGrid
              products={get12Products(bestsellers.length > 0 ? bestsellers : newArrivals)}
              loading={loading}
              onQuickView={(p) => setQuickViewProduct(p)}
              columns={6}
            />
          </div>
        </section>
      </div>

      {/* 6. SHOP BY CATEGORY (DESKTOP ONLY — ONE ROW, NO HORIZONTAL SCROLLBAR, ZERO OVERFLOW) */}
      <div className="hidden min-[1025px]:block">
        <section className="py-10 lg:py-14 bg-white border-t border-[#D6CFFF]/30 relative">
          <div className="max-w-7xl xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header - Center Aligned */}
            <div className="text-center max-w-xl mx-auto mb-6 lg:mb-8">
              <span className="text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-[0.35em] text-[#7464B8]">
                Signature Categories
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[30px] font-light text-[#17151F] mt-0.5 tracking-tight">
                SHOP BY CATEGORY
              </h2>
              <div className="w-10 h-0.5 bg-[#D6CFFF] mx-auto mt-2" />
            </div>

            {/* All 6 Category Cards in ONE Horizontal Row — Fully Fitting inside Container */}
            <div className="grid grid-cols-6 gap-3 lg:gap-3.5 xl:gap-4 w-full">
              {shopByCategories.map((cat, idx) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="w-full"
                >
                  <Link
                    to={cat.link}
                    className="group relative block rounded-xl xl:rounded-2xl overflow-hidden aspect-[4/5] bg-gray-900 border border-[#D6CFFF]/40 shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
                  >
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700 opacity-90 group-hover:opacity-100"
                    />
                    {/* Subtle dark vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent group-hover:from-black/90 transition-all" />

                    {/* Card Content - Center Aligned */}
                    <div className="absolute inset-x-2 bottom-3.5 text-center text-white flex flex-col items-center justify-center">
                      <h3 className="font-serif text-[11px] xl:text-[12px] tracking-wider font-light uppercase text-white group-hover:text-[#D6CFFF] transition-colors leading-snug">
                        {cat.name}
                      </h3>
                      <span className="inline-flex items-center justify-center gap-1 text-[8.5px] tracking-widest text-white/70 uppercase mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Explore</span>
                        <ArrowUpRight className="w-2.5 h-2.5 text-[#D6CFFF]" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 8. VERIFIED CUSTOMER REVIEWS */}
      <CustomerReviews />

      {/* 9. PERMANENT OFFER / FIRST ORDER OFFER (DESKTOP ONLY) */}
      <div className="hidden min-[1025px]:block">
        <PermanentOffer />
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
