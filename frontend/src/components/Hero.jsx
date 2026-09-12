import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MobileHeroCarousel from './MobileHeroCarousel';
import { getHeroConfig, fetchHeroConfig, HERO_UPDATE_EVENT, DEFAULT_HERO_SLIDES } from '../utils/heroBannerStorage';

export default function Hero() {
  const [heroConfig, setHeroConfig] = useState(() => getHeroConfig());
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  // Fetch live Hero Banner configuration from MongoDB Atlas on mount (handles incognito & clean sessions)
  useEffect(() => {
    let isMounted = true;
    fetchHeroConfig().then((liveConfig) => {
      if (isMounted && liveConfig) {
        setHeroConfig(liveConfig);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for real-time hero banner updates from Admin Panel & cross-tab storage
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e?.detail) {
        setHeroConfig(e.detail);
      } else {
        setHeroConfig(getHeroConfig());
      }
    };
    window.addEventListener(HERO_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(HERO_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const desktopConfig = heroConfig.desktop || {
    active: true,
    aspectRatio: '16/5',
    slides: DEFAULT_DESKTOP_SLIDES,
  };
  const rawDesktopSlides = (desktopConfig.slides && desktopConfig.slides.length > 0)
    ? desktopConfig.slides
    : (desktopConfig.banners && desktopConfig.banners.length > 0
        ? desktopConfig.banners
        : (Array.isArray(heroConfig.slides) && !heroConfig.desktop ? heroConfig.slides : DEFAULT_DESKTOP_SLIDES));

  const slides = rawDesktopSlides.filter((s) => s.active !== false);

  const isDesktopActive = heroConfig.active !== false && desktopConfig.active !== false;

  // Auto-play slideshow timer (every 4.5 seconds, paused on hover)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const intervalTime = heroConfig.autoplayInterval || 4500;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPaused, slides.length, heroConfig.autoplayInterval]);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handleSelectDot = (idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlideIndex(idx);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* MOBILE & TABLET HERO BANNER CAROUSEL (0px - 1024px)                       */}
      {/* 100% UNTOUCHED LUXURY EDITORIAL CAROUSEL DESIGN                           */}
      {/* ========================================================================= */}
      <div className="block min-[1025px]:hidden">
        <MobileHeroCarousel />
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP HERO BANNER (1025px+) — 16:5 3-IMAGE SLIDESHOW                    */}
      {/* High-end luxury presentation: 16:5 ratio, smooth crossfade, clickable links */}
      {/* ========================================================================= */}
      {isDesktopActive && slides.length > 0 && (
        <div className="hidden min-[1025px]:block">
          <section
            className="group relative w-full bg-[#120F1D] border-b border-[#D6CFFF]/30 overflow-hidden select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* 16:5 Aspect Ratio Container */}
            <div
              className="relative w-full aspect-[16/5] bg-[#120F1D] overflow-hidden"
              style={{ aspectRatio: '16 / 5' }}
            >
              {slides.map((slide, index) => {
                const isActive = index === currentSlideIndex;
                const destination = slide.destinationUrl || '/collections';

                return (
                  <div
                    key={slide.id || index}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                      isActive
                        ? 'opacity-100 z-10 pointer-events-auto'
                        : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <Link
                      to={destination}
                      className="block w-full h-full cursor-pointer focus:outline-hidden"
                      title={slide.title || `Explore Zivana Jewels Collection — Slide ${index + 1}`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.title || `Zivana Jewels Luxury Collection Slide ${index + 1}`}
                        className="w-full h-full object-cover object-center select-none transition-transform duration-1000 ease-out group-hover:scale-[1.01]"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                      />
                    </Link>
                  </div>
                );
              })}

              {/* Minimal Luxury Navigation Arrows (visible on hover) */}
              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous Slide"
                    className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next Slide"
                    className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Minimal Slide Indicator Dots */}
              {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/15">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleSelectDot(idx, e)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full ${
                        idx === currentSlideIndex
                          ? 'w-6 h-1.5 bg-white'
                          : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
