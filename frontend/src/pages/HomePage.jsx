import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import Hero from '../components/Hero';
import MobileSearchBar from '../components/MobileSearchBar';
import MobileCategoryStrip from '../components/MobileCategoryStrip';
import TrustBadgeSection from '../components/TrustBadgeSection';
import CategoryShowcase from '../components/CategoryShowcase';
import FestiveOfferBanner from '../components/promotions/FestiveOfferBanner';
import ProductGrid from '../components/ProductGrid';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import CustomerReviews from '../components/CustomerReviews';
import api from '../services/api';
import { getCategoryCards, fetchCategoryCards } from '../utils/categoryCardStorage';
import { getCachedCuratedHighlights, fetchCuratedHighlights } from '../services/productCache';
import { preloadProductImage, getOptimizedImageUrl } from '../utils/imageOptimizer';

export default function HomePage({ onOpenSearch }) {
  // Synchronous cache retrieval allows 0ms instant display without skeleton delay on return navigation
  const cachedHighlights = getCachedCuratedHighlights();
  const [newArrivals, setNewArrivals] = useState(() => cachedHighlights?.newArrivals || []);
  const [bestsellers, setBestsellers] = useState(() => cachedHighlights?.bestsellers || []);
  const [womenBestsellers, setWomenBestsellers] = useState(() => {
    if (!cachedHighlights?.bestsellers) return [];
    const wBests = cachedHighlights.bestsellers.filter((p) => p.gender === 'women' || p.gender === 'unisex');
    return wBests.length > 0 ? wBests : cachedHighlights.bestsellers;
  });
  const [menBestsellers, setMenBestsellers] = useState(() => {
    if (!cachedHighlights?.bestsellers) return [];
    const mBests = cachedHighlights.bestsellers.filter((p) => p.gender === 'men');
    return mBests.length > 0 ? mBests : cachedHighlights.bestsellers;
  });
  const [mobileGender, setMobileGender] = useState('women');
  const [loading, setLoading] = useState(
    () => !cachedHighlights || (!cachedHighlights.newArrivals?.length && !cachedHighlights.bestsellers?.length)
  );
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const categoryScrollRef = useRef(null);
  const [canScrollCatLeft, setCanScrollCatLeft] = useState(false);
  const [canScrollCatRight, setCanScrollCatRight] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHighlights = async () => {
      try {
        // fetchCuratedHighlights deduplicates requests and handles background revalidation
        const data = await fetchCuratedHighlights();
        if (isMounted && data) {
          const allNew = data.newArrivals || [];
          const allBest = data.bestsellers || [];
          setNewArrivals(allNew);
          setBestsellers(allBest);

          const wBests = allBest.filter((p) => p.gender === 'women' || p.gender === 'unisex');
          const mBests = allBest.filter((p) => p.gender === 'men');
          setWomenBestsellers(wBests.length > 0 ? wBests : allBest);
          setMenBestsellers(mBests.length > 0 ? mBests : allBest);

          // Preload first 4 product thumbnails for the initial desktop viewport
          const topProducts = allNew.slice(0, 4);
          topProducts.forEach((p) => {
            const img = p.images?.[0] || p.image;
            if (img) preloadProductImage(getOptimizedImageUrl(img, 440, 75));
          });
        }
      } catch (e) {
        console.error('Failed to load highlights:', e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHighlights();
    return () => {
      isMounted = false;
    };
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

  const [categoryCards, setCategoryCards] = useState(() => getCategoryCards());

  // Fetch live category cards from MongoDB Atlas on mount (handles incognito & clean sessions)
  useEffect(() => {
    let isMounted = true;
    fetchCategoryCards().then((liveCards) => {
      if (isMounted && liveCards) {
        setCategoryCards(liveCards);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleCategoryUpdate = () => {
      setCategoryCards(getCategoryCards());
    };
    window.addEventListener('oceanjewel_category_updated', handleCategoryUpdate);
    window.addEventListener('storage', handleCategoryUpdate);
    return () => {
      window.removeEventListener('oceanjewel_category_updated', handleCategoryUpdate);
      window.removeEventListener('storage', handleCategoryUpdate);
    };
  }, []);

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
              priorityCount={6}
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

            {/* Vertical 2-Column Product Grid (11 Products: 8 original + 3 additional) */}
            <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
              {(() => {
                const pool = mobileGender === 'men'
                  ? [...menBestsellers, ...bestsellers, ...newArrivals]
                  : [...womenBestsellers, ...bestsellers, ...newArrivals];
                const uniquePool = pool.filter(
                  (v, i, a) => a.findIndex((t) => (t._id || t.id) === (v._id || v.id)) === i
                );
                // Guarantee at least 11 products (+3 additional product cards)
                const targetCount = 11;
                const itemsToShow = [];
                if (uniquePool.length >= targetCount) {
                  itemsToShow.push(...uniquePool.slice(0, targetCount));
                } else if (uniquePool.length > 0) {
                  itemsToShow.push(...uniquePool);
                  let i = 0;
                  while (itemsToShow.length < targetCount && uniquePool.length > 0) {
                    itemsToShow.push(uniquePool[i % uniquePool.length]);
                    i++;
                  }
                }

                if (loading && itemsToShow.length === 0) {
                  return [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-white p-2.5 sm:p-3 shadow-sm border border-[#D6CFFF]/30 animate-pulse"
                    >
                      <div className="aspect-[4/5] bg-gray-200 rounded-xl mb-3" />
                      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                    </div>
                  ));
                }

                return itemsToShow.map((product, idx) => (
                  <ProductCard
                    key={`${product._id || product.id}-${idx}`}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    priority={idx < 2}
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

            {/* Vertical 2-Column Product Grid (9 Products: 6 original + 3 additional) */}
            <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
              {(() => {
                const targetCount = 9; // +3 additional product cards
                const pool = newArrivals.length > 0 ? newArrivals : bestsellers;
                const itemsToShow = [];
                if (pool.length >= targetCount) {
                  itemsToShow.push(...pool.slice(0, targetCount));
                } else if (pool.length > 0) {
                  itemsToShow.push(...pool);
                  let i = 0;
                  while (itemsToShow.length < targetCount && pool.length > 0) {
                    itemsToShow.push(pool[i % pool.length]);
                    i++;
                  }
                }

                if (loading && itemsToShow.length === 0) {
                  return [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-white p-2.5 sm:p-3 shadow-sm border border-[#D6CFFF]/30 animate-pulse"
                    >
                      <div className="aspect-[4/5] bg-gray-200 rounded-xl mb-3" />
                      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                    </div>
                  ));
                }

                return itemsToShow.map((product, idx) => (
                  <ProductCard
                    key={`${product._id || product.id}-${idx}`}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    priority={idx < 2}
                  />
                ));
              })()}
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
              priorityCount={0}
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
              {categoryCards.map((cat, idx) => (
                <motion.div
                  key={cat.id || cat.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="w-full"
                >
                  <Link
                    to={cat.link || '/shop'}
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

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
