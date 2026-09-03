import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, Copy, Check } from 'lucide-react';
import { festivePromotionData, isPromotionActive } from './promotionsData';
import teejBannerImage from '../../assets/teej_festive_offer_banner.png';

export default function FestiveOfferBanner({ data = festivePromotionData }) {
  const shouldReduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  // Return null if expired or disabled
  if (!isPromotionActive(data)) return null;

  const handleCopyCoupon = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (data.couponCode) {
      navigator.clipboard.writeText(data.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const imageSrc = data.image || teejBannerImage;

  return (
    <section className="py-10 sm:py-14 bg-[#FAF9FF] relative overflow-hidden border-b border-[#D6CFFF]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-[0_15px_45px_rgba(23,21,31,0.08)] border border-[#D6CFFF]/40 min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex items-center bg-[#0d2e2b]"
        >
          {/* 1. Attached Teej Background Image */}
          <div className="absolute inset-0 pointer-events-none select-none">
            <img
              src={imageSrc}
              alt="Ocean Jewel Teej Festive Collection"
              className="w-full h-full object-cover object-[80%_center] sm:object-[70%_center] md:object-right lg:object-center"
              loading="eager"
            />

            {/* 30% Left-Side Black Gradient Overlay for Enhanced Text Contrast & Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/15 via-45% to-transparent hidden sm:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/15 to-transparent sm:hidden" />
          </div>

          {/* 2. Left-Aligned Offer Content */}
          <div className="relative z-10 w-full p-6 sm:p-10 lg:p-14 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-left space-y-4 sm:space-y-4.5">
            {/* Small Badge */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white shadow-sm">
                <Sparkles className="w-3 h-3 text-[#D6CFFF] animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] uppercase text-[#F3EFFF]">
                  {data.eyebrow}
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-light text-white leading-[1.12] tracking-tight drop-shadow-md">
              Celebrate traditions. <br />
              <span className="italic font-normal bg-gradient-to-r from-[#FFFFFF] via-[#E8E3FF] to-[#D6CFFF] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
                Wear your story.
              </span>
            </h2>

            {/* Offer Badge & Supporting Text */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#D6CFFF] text-[#17151F] text-xs sm:text-[13px] font-bold tracking-wide shadow-md">
                <span>{data.offerText}</span>
              </div>

              {data.subtitle && (
                <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed max-w-xs sm:max-w-sm drop-shadow-sm">
                  {data.subtitle}
                </p>
              )}
            </div>

            {/* Action Area: CTA Button + Coupon Code Pill */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-3.5">
              {/* Primary CTA */}
              <Link
                to={data.link}
                className="px-6 sm:px-7 py-3 bg-white text-[#17151F] rounded-xl font-semibold tracking-[0.16em] text-xs uppercase shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:bg-[#FAF9FF] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 btn-shine flex items-center justify-center gap-2 group"
              >
                <span>{data.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#7464B8] group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Secondary Coupon Pill */}
              {data.couponCode && (
                <button
                  type="button"
                  onClick={handleCopyCoupon}
                  className="px-3.5 py-3 bg-black/40 backdrop-blur-md border border-white/30 hover:border-[#D6CFFF] text-white rounded-xl text-xs tracking-wider font-mono flex items-center gap-2 transition-all shadow-md group"
                  title="Click to copy coupon code"
                >
                  <span className="text-[10px] text-[#D6CFFF] uppercase tracking-widest font-sans font-bold">
                    Code:
                  </span>
                  <span className="font-bold font-mono text-white">{data.couponCode}</span>
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
  );
}
