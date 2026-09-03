import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, Copy, Check, Gift } from 'lucide-react';
import { permanentPromotionData, isPromotionActive } from './promotionsData';
import { useToast } from '../../context/ToastContext';

export default function PermanentOffer({ data = permanentPromotionData }) {
  const shouldReduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  if (!isPromotionActive(data)) return null;

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (data.couponCode) {
      navigator.clipboard.writeText(data.couponCode);
      setCopied(true);
      if (addToast) {
        addToast(`Coupon code ${data.couponCode} copied to clipboard!`, 'success');
      }
      setTimeout(() => setCopied(false), 2400);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAF9FF] relative overflow-hidden border-b border-[#D6CFFF]/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[24px] sm:rounded-[30px] p-6 sm:p-10 lg:p-12 text-center bg-gradient-to-b from-white via-[#F8F7FF] to-[#F3EFFF] border border-[#D6CFFF]/60 shadow-[0_10px_35px_rgba(214,207,255,0.25)] overflow-hidden"
        >
          {/* Subtle Ambient Background Accents */}
          <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-[#D6CFFF]/20 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-[#E8E3FF]/30 blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto space-y-4 sm:space-y-5">
            {/* Eyebrow */}
            <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-[#17151F]/5 border border-[#D6CFFF]/60">
              <Gift className="w-3 h-3 text-[#7464B8]" />
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7464B8]">
                {data.eyebrow}
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-light text-[#17151F] tracking-tight">
              {data.title}
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 font-light max-w-md mx-auto leading-relaxed">
              {data.description}
            </p>

            {/* Coupon Chip & CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              {/* Copyable Coupon Box */}
              {data.couponCode && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-[#D6CFFF] shadow-sm hover:border-[#7464B8] text-xs text-[#17151F] flex items-center justify-center gap-2.5 transition-all group"
                  title="Click to copy coupon code"
                >
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Use Code:
                  </span>
                  <span className="font-mono font-bold tracking-wider text-[#17151F]">
                    {data.couponCode}
                  </span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#7464B8] transition-colors" />
                  )}
                  {copied && (
                    <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>
                  )}
                </button>
              )}

              {/* Action Button */}
              <Link
                to={data.link}
                className="w-full sm:w-auto px-7 py-3 bg-[#17151F] text-white rounded-xl text-xs font-semibold tracking-[0.18em] uppercase hover:bg-[#2A2635] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 btn-shine flex items-center justify-center gap-2 group"
              >
                <span>{data.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D6CFFF] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
