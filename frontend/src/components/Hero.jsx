import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ShieldCheck, ArrowUpRight, Star, Gem } from 'lucide-react';
import heroBannerImage from '../assets/a_high_end_fashion_jewelry_website_hero_banner_l.png';
import MobileHeroCarousel from './MobileHeroCarousel';

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const bgVariants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 1.03 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.1,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* MOBILE & TABLET HERO BANNER CAROUSEL (0px - 1024px)                       */}
      {/* ========================================================================= */}
      <div className="block min-[1025px]:hidden">
        <MobileHeroCarousel />
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP HERO BANNER (1025px+) — 100% UNTOUCHED & IDENTICAL                */}
      {/* ========================================================================= */}
      <div className="hidden min-[1025px]:block">
        <section className="relative px-3 sm:px-4 lg:px-0 py-2 sm:py-3 lg:py-0 bg-[#FAF9FF] lg:bg-[#120F1D] border-b border-[#D6CFFF]/30">
          <div className="relative rounded-3xl lg:rounded-none overflow-hidden min-h-[460px] sm:min-h-[520px] lg:min-h-[600px] xl:min-h-[640px] flex items-end lg:items-center justify-start bg-[#120F1D] shadow-md lg:shadow-none border border-[#D6CFFF]/30 lg:border-none">
            {/* 1. HERO BACKGROUND IMAGE (RESPONSIVE CROPPING & DESKTOP PRESERVED) */}
            <motion.div
              variants={bgVariants}
              initial="hidden"
              animate="visible"
              className="absolute inset-0 w-full h-full pointer-events-none select-none"
            >
              <img
                src={heroBannerImage}
                alt="Ocean Jewel Luxury Indian Jewellery Campaign featuring 18K Gold and Amethyst Heirlooms"
                className="w-full h-full object-cover object-[78%_center] sm:object-[68%_center] md:object-[60%_center] lg:object-center"
                loading="eager"
                fetchPriority="high"
              />

              {/* Soft Mobile Bottom Vignette for Crisp Mobile Text Readability (Hidden on Desktop) */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#130E20]/95 via-[#130E20]/50 via-50% to-transparent lg:hidden" />
            </motion.div>

            {/* 2. HERO CONTENT CONTAINER (LEFT-ALIGNED OVERLAY) */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-7 lg:px-12 xl:px-16 py-6 sm:py-10 lg:py-14 flex items-center">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-xl lg:max-w-2xl text-left space-y-3.5 sm:space-y-5"
              >
                {/* Eyebrow Pill */}
                <motion.div variants={itemVariants}>
                  <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-[#D6CFFF] animate-pulse" />
                    <span className="text-[9px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase text-[#F3EFFF]">
                      The Royal Anti-Tarnish Collection &bull; 2026
                    </span>
                  </div>
                </motion.div>

                {/* Primary Editorial Heading */}
                <motion.div variants={itemVariants}>
                  <h1 className="font-serif text-2xl sm:text-4xl lg:text-6xl xl:text-[66px] font-light text-white leading-[1.08] tracking-tight drop-shadow-md">
                    JEWELLERY <br />
                    <span className="italic font-normal bg-gradient-to-r from-[#FFFFFF] via-[#E8E3FF] to-[#D6CFFF] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(214,207,255,0.4)]">
                      THAT DEFINES
                    </span> <br />
                    YOU.
                  </h1>
                </motion.div>

                {/* Supporting Description */}
                <motion.p
                  variants={itemVariants}
                  className="text-xs sm:text-sm lg:text-base text-[#E8E3FF]/90 font-light max-w-lg leading-relaxed drop-shadow-sm line-clamp-2 sm:line-clamp-none"
                >
                  Timeless pieces designed for modern Indian elegance. Handcrafted with 18K Real Gold PVD coating, natural freshwater pearls, and guaranteed zero tarnish.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  variants={itemVariants}
                  className="pt-1 flex flex-row items-center gap-2.5 sm:gap-3.5"
                >
                  {/* Primary CTA: SHOP WOMEN */}
                  <Link
                    to="/women"
                    className="flex-1 sm:flex-none px-5 sm:px-7 py-2.5 sm:py-3.5 bg-white text-[#17151F] rounded-xl font-semibold tracking-[0.15em] sm:tracking-[0.18em] text-[11px] sm:text-xs uppercase shadow-[0_8px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(214,207,255,0.65)] hover:bg-[#FAF9FF] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 btn-shine flex items-center justify-center gap-1.5 sm:gap-2 group"
                  >
                    <span>Shop Women</span>
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7464B8] group-hover:text-[#17151F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>

                  {/* Secondary CTA: SHOP MEN */}
                  <Link
                    to="/men"
                    className="flex-1 sm:flex-none px-5 sm:px-7 py-2.5 sm:py-3.5 bg-black/35 backdrop-blur-md text-white rounded-xl font-semibold tracking-[0.15em] sm:tracking-[0.18em] text-[11px] sm:text-xs uppercase border border-white/30 hover:border-[#D6CFFF] hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 sm:gap-2 group shadow-md"
                  >
                    <span>Shop Men</span>
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D6CFFF] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </motion.div>

                {/* Trust Badges & Social Proof */}
                <motion.div
                  variants={itemVariants}
                  className="pt-3 sm:pt-5 border-t border-white/15 flex flex-wrap items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-white/90"
                >
                  {/* Review pill */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <img
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[#17151F] object-cover"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                        alt="Customer"
                      />
                      <img
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[#17151F] object-cover"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                        alt="Customer"
                      />
                      <img
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[#17151F] object-cover"
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                        alt="Customer"
                      />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-2 sm:w-2.5 h-2 sm:h-2.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-[#E8E3FF]/80 font-medium">4.9 (15k+ Reviews)</p>
                    </div>
                  </div>

                  {/* Quality Guarantee badge */}
                  <div className="flex items-center gap-1 font-medium text-[#E8E3FF]/90">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D6CFFF]" />
                    <span className="text-[9px] sm:text-[11px]">Anti-Tarnish</span>
                  </div>

                  {/* 18K Real Gold PVD badge */}
                  <div className="hidden sm:flex items-center gap-1 font-medium text-[#E8E3FF]/90">
                    <Gem className="w-3.5 h-3.5 text-[#D6CFFF]" />
                    <span className="text-[9px] sm:text-[11px]">18K Gold PVD</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

