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
      {/* DESKTOP HERO BANNER (1025px+) — 16:6 RATIO, WIDE, CLEAN & ELEGANT         */}
      {/* ========================================================================= */}
      <div className="hidden min-[1025px]:block">
        <section className="relative w-full bg-[#120F1D] border-b border-[#D6CFFF]/30 overflow-hidden">
          <div
            className="relative w-full lg:aspect-[16/6] lg:min-h-0 overflow-hidden flex items-center justify-start bg-[#120F1D]"
            style={{ aspectRatio: '16 / 6' }}
          >
            {/* 1. HERO BACKGROUND IMAGE (16:6 PROPORTIONS, CRISP COVER, NO DISTORTION) */}
            <motion.div
              variants={bgVariants}
              initial="hidden"
              animate="visible"
              className="absolute inset-0 w-full h-full pointer-events-none select-none"
            >
              <img
                src={heroBannerImage}
                alt="Ocean Jewel Luxury Indian Jewellery Campaign featuring 18K Gold and Amethyst Heirlooms"
                className="w-full h-full object-cover object-[center_32%] select-none pointer-events-none"
                loading="eager"
                fetchPriority="high"
              />

              {/* Refined subtle gradient for optimal editorial contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#120F1D]/90 via-[#120F1D]/55 via-45% to-transparent pointer-events-none" />
            </motion.div>

            {/* 2. HERO CONTENT CONTAINER (BALANCED FOR 16:6 VIEWPORT) */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 xl:px-16 py-4 lg:py-6 xl:py-8 flex items-center">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-lg lg:max-w-xl text-left space-y-2.5 lg:space-y-3.5"
              >
                {/* Eyebrow Pill */}
                <motion.div variants={itemVariants}>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
                    <Sparkles className="w-3 h-3 text-[#D6CFFF] animate-pulse" />
                    <span className="text-[9px] lg:text-[10px] font-semibold tracking-[0.2em] uppercase text-[#F3EFFF]">
                      The Royal Anti-Tarnish Collection &bull; 2026
                    </span>
                  </div>
                </motion.div>

                {/* Primary Editorial Heading */}
                <motion.div variants={itemVariants}>
                  <h1 className="font-serif text-2xl lg:text-[34px] xl:text-[42px] font-light text-white leading-[1.08] tracking-tight drop-shadow-md">
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
                  className="text-xs lg:text-[13px] text-[#E8E3FF]/90 font-light max-w-md lg:max-w-lg leading-relaxed drop-shadow-sm line-clamp-2"
                >
                  Timeless pieces designed for modern Indian elegance. Handcrafted with 18K Real Gold PVD coating, natural freshwater pearls, and guaranteed zero tarnish.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  variants={itemVariants}
                  className="pt-0.5 flex flex-row items-center gap-2.5 lg:gap-3"
                >
                  {/* Primary CTA: SHOP WOMEN */}
                  <Link
                    to="/women"
                    className="px-5 lg:px-6 py-2 lg:py-2.5 bg-white text-[#17151F] rounded-xl font-semibold tracking-[0.14em] text-[11px] uppercase shadow-[0_8px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(214,207,255,0.65)] hover:bg-[#FAF9FF] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 btn-shine flex items-center justify-center gap-1.5 group"
                  >
                    <span>Shop Women</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#7464B8] group-hover:text-[#17151F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>

                  {/* Secondary CTA: SHOP MEN */}
                  <Link
                    to="/men"
                    className="px-5 lg:px-6 py-2 lg:py-2.5 bg-black/40 backdrop-blur-md text-white rounded-xl font-semibold tracking-[0.14em] text-[11px] uppercase border border-white/30 hover:border-[#D6CFFF] hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 group shadow-md"
                  >
                    <span>Shop Men</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#D6CFFF] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </motion.div>

                {/* Trust Badges & Social Proof */}
                <motion.div
                  variants={itemVariants}
                  className="pt-2 lg:pt-3 border-t border-white/15 flex flex-wrap items-center gap-3 lg:gap-5 text-[10px] text-white/90"
                >
                  {/* Review pill */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5">
                      <img
                        className="w-5 h-5 rounded-full border border-[#17151F] object-cover"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                        alt="Customer"
                      />
                      <img
                        className="w-5 h-5 rounded-full border border-[#17151F] object-cover"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                        alt="Customer"
                      />
                      <img
                        className="w-5 h-5 rounded-full border border-[#17151F] object-cover"
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                        alt="Customer"
                      />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-2 h-2 fill-current" />
                        ))}
                      </div>
                      <p className="text-[9px] text-[#E8E3FF]/80 font-medium">4.9 (15k+ Reviews)</p>
                    </div>
                  </div>

                  {/* Quality Guarantee badge */}
                  <div className="flex items-center gap-1 font-medium text-[#E8E3FF]/90">
                    <ShieldCheck className="w-3 h-3 text-[#D6CFFF]" />
                    <span className="text-[10px]">Anti-Tarnish</span>
                  </div>

                  {/* 18K Real Gold PVD badge */}
                  <div className="flex items-center gap-1 font-medium text-[#E8E3FF]/90">
                    <Gem className="w-3 h-3 text-[#D6CFFF]" />
                    <span className="text-[10px]">18K Gold PVD</span>
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

