import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, Copy, Check } from 'lucide-react';
import { festivePromotionData, isPromotionActive } from './promotionsData';
import { getFestiveConfig, fetchFestiveConfig, FESTIVE_UPDATE_EVENT } from '../../utils/festiveBannerStorage';

export default function FestiveOfferBanner({ data = festivePromotionData }) {
  const shouldReduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [storedConfig, setStoredConfig] = useState(() => getFestiveConfig());

  // Fetch live Festive configuration from MongoDB Atlas on mount (handles incognito & clean sessions)
  useEffect(() => {
    let isMounted = true;
    fetchFestiveConfig().then((liveConfig) => {
      if (isMounted && liveConfig) {
        setStoredConfig(liveConfig);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time reactive synchronization with Admin Panel & across tabs
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e?.detail) {
        setStoredConfig(e.detail);
      } else {
        setStoredConfig(getFestiveConfig());
      }
    };
    window.addEventListener(FESTIVE_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(FESTIVE_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Return null if disabled
  if (storedConfig.active === false || !isPromotionActive(data)) return null;

  const handleCopyCoupon = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const code = storedConfig.couponCode || data.couponCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const imageSrc = storedConfig.image || data.image || teejBannerImage;

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP (1025px+): 16:4 IMAGE-ONLY CLICKABLE FESTIVE BANNER */}
      {/* Zero text, zero badges, zero overlays. Clicks anywhere to /collections */}
      {/* ============================================================ */}
      <div className="hidden min-[1025px]:block">
        <section className="py-4 lg:py-6 bg-[#FAF9FF] relative overflow-hidden border-b border-[#D6CFFF]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to={storedConfig.destinationUrl || '/collections'}
              className="block group relative w-full aspect-[16/4] rounded-2xl lg:rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(23,21,31,0.06)] border border-[#D6CFFF]/40 transition-all duration-300 cursor-pointer"
              style={{ aspectRatio: '16 / 4' }}
              title="Explore Zivana Jewels Festive Collections"
            >
              <img
                src={imageSrc}
                alt="Zivana Jewels Festive Season Collection"
                className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-[1.01]"
                style={{ width: '100%', aspectRatio: '16 / 4', objectFit: 'cover' }}
                loading="eager"
              />
            </Link>
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* 2. MOBILE & TABLET (<1025px): 100% UNTOUCHED ORIGINAL LAYOUT  */}
      {/* ============================================================ */}
      <div className="block min-[1025px]:hidden">
        <section className="py-10 sm:py-14 bg-[#FAF9FF] relative overflow-hidden border-b border-[#D6CFFF]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-[0_15px_45px_rgba(23,21,31,0.08)] border border-[#D6CFFF]/40 min-h-[420px] sm:min-h-[480px] flex items-center bg-[#0d2e2b]"
            >
              {/* Attached Background Image */}
              <div className="absolute inset-0 pointer-events-none select-none">
                <img
                  src={imageSrc}
                  alt="Zivana Jewels Teej Festive Collection"
                  className="w-full h-full object-cover object-[80%_center] sm:object-[70%_center] md:object-right"
                  loading="eager"
                />

                {/* Left-Side Gradient Overlay for Mobile/Tablet Contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/15 via-45% to-transparent hidden sm:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/15 to-transparent sm:hidden" />
              </div>

              {/* Mobile/Tablet Content */}
              <div className="relative z-10 w-full p-6 sm:p-10 max-w-xs sm:max-w-sm md:max-w-md text-left space-y-4 sm:space-y-4.5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white shadow-sm">
                    <Sparkles className="w-3 h-3 text-[#D6CFFF] animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] uppercase text-[#F3EFFF]">
                      {storedConfig.eyebrow || data.eyebrow}
                    </span>
                  </div>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-light text-white leading-[1.12] tracking-tight drop-shadow-md">
                  {storedConfig.title || 'Celebrate traditions.'} <br />
                  <span className="italic font-normal bg-gradient-to-r from-[#FFFFFF] via-[#E8E3FF] to-[#D6CFFF] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
                    {storedConfig.highlightTitle || 'Wear your story.'}
                  </span>
                </h2>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#D6CFFF] text-[#17151F] text-xs sm:text-[13px] font-bold tracking-wide shadow-md">
                    <span>{storedConfig.offerText || data.offerText}</span>
                  </div>

                  {(storedConfig.description || data.subtitle) && (
                    <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed max-w-xs sm:max-w-sm drop-shadow-sm">
                      {storedConfig.description || data.subtitle}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-3.5">
                  <Link
                    to={storedConfig.ctaLink || data.link || '/collections'}
                    className="px-6 sm:px-7 py-3 bg-white text-[#17151F] rounded-xl font-semibold tracking-[0.16em] text-xs uppercase shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:bg-[#FAF9FF] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 btn-shine flex items-center justify-center gap-2 group"
                  >
                    <span>{storedConfig.ctaText || data.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7464B8] group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {(storedConfig.couponCode || data.couponCode) && (
                    <button
                      type="button"
                      onClick={handleCopyCoupon}
                      className="px-3.5 py-3 bg-black/40 backdrop-blur-md border border-white/30 hover:border-[#D6CFFF] text-white rounded-xl text-xs tracking-wider font-mono flex items-center gap-2 transition-all shadow-md group"
                      title="Click to copy coupon code"
                    >
                      <span className="text-[10px] text-[#D6CFFF] uppercase tracking-widest font-sans font-bold">
                        Code:
                      </span>
                      <span className="font-bold font-mono text-white">
                        {storedConfig.couponCode || data.couponCode}
                      </span>
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 animate-scale" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" />
                      )}
                      {copied && (
                        <span className="text-[10px] text-emerald-400 font-sans font-medium">Copied!</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
