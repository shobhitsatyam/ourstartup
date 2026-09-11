import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { initialHeroBanners } from './promotions/heroBannersData';
import { getHeroConfig, HERO_UPDATE_EVENT } from '../utils/heroBannerStorage';

export default function MobileHeroCarousel() {
  const [heroConfig, setHeroConfig] = useState(() => getHeroConfig());

  useEffect(() => {
    const handleUpdate = () => setHeroConfig(getHeroConfig());
    window.addEventListener(HERO_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(HERO_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const banners = (heroConfig.slides && heroConfig.slides.length > 0
    ? heroConfig.slides
    : initialHeroBanners)
    .filter((b) => b.active !== false)
    .map((b, idx) => ({
      id: b.id || `banner-${idx}`,
      title: b.title || 'JEWELLERY THAT DEFINES YOU',
      eyebrow: b.eyebrow || (idx === 0 ? 'The Royal Anti-Tarnish Collection' : idx === 1 ? 'Festive & Royal Edit' : idx === 2 ? 'New Arrivals' : 'Bestsellers'),
      description: b.subtitle || b.description || 'Timeless pieces handcrafted with 18K Real Gold PVD coating.',
      image: b.image || initialHeroBanners[Math.min(idx, initialHeroBanners.length - 1)].image,
      imageAlt: b.title || 'Zivana Jewels Luxury Jewellery',
      primaryCta: {
        text: b.ctaText || b.primaryCta?.text || 'Explore Collection',
        link: b.destinationUrl || b.primaryCta?.link || '/shop',
      },
      secondaryCta: b.secondaryCta || null,
      offerBadge: b.offerBadge || null,
    }));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  const isDraggingRef = useRef(false);

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
      className="relative w-full bg-transparent px-3 sm:px-6 pt-2.5 sm:pt-4 pb-1 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Zivana Jewels Promotional Banners"
    >
      {/* 1. CAROUSEL BANNER CONTAINER - Strict 16:10 Aspect Ratio, Rounded Corners, No Black Strip */}
      <div
        className="relative w-full aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-[#D6CFFF]/25 touch-pan-y bg-[#FAF9FF]"
        style={{ touchAction: 'pan-y' }}
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
            onDragStart={() => {
              isDraggingRef.current = true;
              triggerInteractionPause();
            }}
            onDragEnd={(e, { offset, velocity }) => {
              triggerInteractionPause();
              const swipeThreshold = 45;
              if (offset.x < -swipeThreshold || velocity.x < -300) {
                nextSlide();
              } else if (offset.x > swipeThreshold || velocity.x > 300) {
                prevSlide();
              }
              setTimeout(() => {
                isDraggingRef.current = false;
              }, 80);
            }}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing rounded-2xl sm:rounded-3xl overflow-hidden"
          >
            {/* Clean Image-Only Presentation (16:10 Aspect Ratio, No Overlays, No Text, No CTA Buttons) */}
            <Link
              to={currentBanner.primaryCta?.link || '/shop'}
              onClick={(e) => {
                if (isDraggingRef.current) {
                  e.preventDefault();
                } else {
                  triggerInteractionPause();
                }
              }}
              className="block w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden"
              aria-label={`Explore ${currentBanner.title}`}
            >
              <img
                src={currentBanner.image}
                alt={currentBanner.imageAlt || currentBanner.title || 'Zivana Jewels Luxury Jewellery'}
                className="w-full h-full object-cover object-center pointer-events-none select-none rounded-2xl sm:rounded-3xl"
                loading="eager"
                draggable={false}
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* 2. PAGINATION DOTS (Inside Hero Banner with Luxury Frosted Glass Pill) */}
        {banners.length > 1 && (
          <div
            className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20 shadow-xs"
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
                  className="p-0.5 focus:outline-none rounded-full transition-all"
                >
                  <motion.div
                    animate={{
                      width: isActive ? 20 : 6,
                      backgroundColor: isActive ? '#FFFFFF' : '#D6CFFF',
                      opacity: isActive ? 1 : 0.6,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="h-1.5 rounded-full shadow-2xs hover:opacity-100 transition-opacity"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

