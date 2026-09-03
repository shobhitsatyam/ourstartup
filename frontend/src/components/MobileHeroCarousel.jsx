import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUpRight, Tag, ShieldCheck, Star } from 'lucide-react';
import { initialHeroBanners } from './promotions/heroBannersData';

export default function MobileHeroCarousel() {
  const banners = initialHeroBanners.filter((b) => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef(null);
  const autoPlayTimerRef = useRef(null);

  // Trigger pause on user interaction and resume after 3.5s
  const triggerInteractionPause = useCallback(() => {
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 3500);
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = (idx) => {
    if (idx === currentIndex) return;
    triggerInteractionPause();
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  // Autoplay loop every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    autoPlayTimerRef.current = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  // Slide transition motion variants
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0.85,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0.85,
    }),
  };

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <div
      className="relative w-full px-3 sm:px-4 md:px-6 py-2 bg-[#FAF9FF]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Ocean Jewel Promotional Banners"
    >
      {/* 1. CAROUSEL BANNER CONTAINER */}
      <div
        className="relative w-full rounded-3xl overflow-hidden shadow-md border border-[#D6CFFF]/40 bg-[#120F1D] select-none touch-pan-y"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Fixed 16:10 Aspect Ratio on Mobile and Tablet */}
        <div
          className="relative w-full aspect-[16/10] overflow-hidden"
          style={{ aspectRatio: '16 / 10' }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentBanner.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 320, damping: 32 },
                opacity: { duration: 0.25 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={triggerInteractionPause}
              onDragEnd={(e, { offset, velocity }) => {
                triggerInteractionPause();
                const swipeThreshold = 45;
                if (offset.x < -swipeThreshold || velocity.x < -300) {
                  nextSlide();
                } else if (offset.x > swipeThreshold || velocity.x > 300) {
                  prevSlide();
                }
              }}
              className="absolute inset-0 w-full h-full flex items-end cursor-grab active:cursor-grabbing"
            >
              {/* Background Image with Full Object Cover */}
              <img
                src={currentBanner.image}
                alt={currentBanner.imageAlt}
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                loading="eager"
              />

              {/* Luxury Deep Vignette for Crystal-Clear Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#130E20]/95 via-[#130E20]/50 via-55% to-transparent pointer-events-none" />

              {/* Overlay Content Box — Proportioned for 16:10 */}
              <div className="relative z-10 w-full p-2.5 xs:p-3.5 sm:p-6 md:p-8 flex flex-col justify-end text-left space-y-1 xs:space-y-1.5 sm:space-y-3">
                {/* Eyebrow Pill + Coupon Tag */}
                <div className="flex items-center gap-1.5 xs:gap-2">
                  <div className="inline-flex items-center gap-1 px-2 xs:px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-2xs">
                    <Sparkles className="w-2 xs:w-2.5 sm:w-3 h-2 xs:h-2.5 sm:h-3 text-[#D6CFFF] animate-pulse" />
                    <span className="text-[7.5px] xs:text-[8.5px] sm:text-[10px] font-semibold tracking-[0.16em] uppercase text-[#F3EFFF] truncate max-w-[200px] xs:max-w-none">
                      {currentBanner.eyebrow}
                    </span>
                  </div>

                  {currentBanner.couponCode && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#D6CFFF]/20 border border-[#D6CFFF]/40 text-[#E8E3FF] text-[7.5px] xs:text-[8.5px] sm:text-[9.5px] font-mono font-bold tracking-wider">
                      <Tag className="w-2 h-2 text-[#D6CFFF]" />
                      <span>{currentBanner.couponCode}</span>
                    </span>
                  )}
                </div>

                {/* Banner Heading */}
                <h2 className="font-serif text-[15px] xs:text-[17px] sm:text-2xl md:text-3xl font-light text-white leading-[1.12] tracking-tight drop-shadow-md line-clamp-2">
                  {currentBanner.title}
                </h2>

                {/* Offer Highlight or Description */}
                {currentBanner.offerBadge ? (
                  <div className="inline-block">
                    <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-[#D6CFFF] bg-white/10 backdrop-blur-xs px-1.5 xs:px-2 py-0.5 rounded-md border border-[#D6CFFF]/30 line-clamp-1">
                      ✨ {currentBanner.offerBadge}
                    </span>
                  </div>
                ) : (
                  <p className="text-[9px] xs:text-[10px] sm:text-xs text-[#E8E3FF]/90 font-light line-clamp-1 max-w-md leading-relaxed drop-shadow-xs">
                    {currentBanner.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="pt-0.5 flex items-center gap-1.5 xs:gap-2 sm:gap-3">
                  {/* Primary CTA */}
                  <Link
                    to={currentBanner.primaryCta.link}
                    onClick={triggerInteractionPause}
                    className="px-3 xs:px-4 sm:px-6 py-1.5 sm:py-2.5 bg-white text-[#17151F] rounded-lg xs:rounded-xl font-semibold tracking-[0.12em] sm:tracking-[0.14em] text-[9.5px] xs:text-[10.5px] sm:text-xs uppercase shadow-md hover:bg-[#FAF9FF] transition-all transform active:scale-95 btn-shine flex items-center gap-1 group"
                  >
                    <span>{currentBanner.primaryCta.text}</span>
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#7464B8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>

                  {/* Secondary CTA (If present) */}
                  {currentBanner.secondaryCta && (
                    <Link
                      to={currentBanner.secondaryCta.link}
                      onClick={triggerInteractionPause}
                      className="px-2.5 xs:px-3.5 sm:px-5 py-1.5 sm:py-2.5 bg-black/40 backdrop-blur-md text-white rounded-lg xs:rounded-xl font-semibold tracking-[0.12em] sm:tracking-[0.14em] text-[9.5px] xs:text-[10.5px] sm:text-xs uppercase border border-white/30 hover:bg-white/15 transition-all transform active:scale-95 flex items-center gap-1 group"
                    >
                      <span>{currentBanner.secondaryCta.text}</span>
                      <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D6CFFF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  )}
                </div>

                {/* Micro Proof Badges (Compact) */}
                <div className="hidden xs:flex pt-1 sm:pt-2 border-t border-white/15 items-center gap-2 sm:gap-3 text-[8px] xs:text-[8.5px] sm:text-[10px] text-white/80">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D6CFFF]" />
                    <span>Anti-Tarnish</span>
                  </div>
                  <span className="text-white/30">&bull;</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />
                    <span>4.9 (15k+ Reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 2. PAGINATION DOTS (Directly Below Hero Banner) */}
      <div
        className="flex items-center justify-center gap-2 pt-2.5 pb-1"
        role="tablist"
        aria-label="Carousel pagination dots"
      >
        {banners.map((b, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={b.id}
              onClick={() => goToSlide(idx)}
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${idx + 1}: ${b.title}`}
              className="py-1 px-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7464B8] rounded-full transition-all"
            >
              <motion.div
                animate={{
                  width: isActive ? 24 : 7,
                  backgroundColor: isActive ? '#7464B8' : '#D6CFFF',
                  opacity: isActive ? 1 : 0.6,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-1.5 rounded-full shadow-2xs hover:opacity-100 transition-opacity"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
