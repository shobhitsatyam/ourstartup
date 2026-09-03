import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Droplet, Sparkles, HeartHandshake, Award } from 'lucide-react';

export default function TrustBadgeSection() {
  const usps = [
    {
      icon: ShieldCheck,
      title: 'ANTI-TARNISH PVD',
      desc: 'Infused with 18K Real Gold Physical Vapor Deposition nano-coating that never oxidizes.',
    },
    {
      icon: Droplet,
      title: '100% WATERPROOF',
      desc: 'Shower, swim, workout or wear during Indian monsoons without any discoloration.',
    },
    {
      icon: HeartHandshake,
      title: 'SKIN FRIENDLY',
      desc: 'Hypoallergenic 316L medical grade steel. Zero nickel, zero lead, zero irritation.',
    },
    {
      icon: Award,
      title: 'INDIAN CRAFTSMANSHIP',
      desc: 'Heirloom detailing meeting modern contemporary ergonomics for everyday luxury.',
    },
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* MOBILE & TABLET: USP CARDS COMPLETELY REMOVED                             */}
      {/* ========================================================================= */}

      {/* ========================================================================= */}
      {/* DESKTOP (1025px+) — 100% UNTOUCHED & IDENTICAL TO ORIGINAL                */}
      {/* ========================================================================= */}
      <div className="hidden min-[1025px]:block">
        <section className="py-8 sm:py-10 lg:py-12 bg-[#FAF9FF] relative overflow-hidden border-b border-[#D6CFFF]/25">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] text-[#7464B8]">
                The Quality Benchmark
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-light text-[#17151F] mt-1 tracking-tight">
                ENGINEERED TO NEVER FADE
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 font-light mt-1.5">
                Why over 50,000 customers trust Ocean Jewel for everyday and celebratory wear.
              </p>
            </div>

            {/* Sleek Compact Luxury Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {usps.map((usp, idx) => {
                const Icon = usp.icon;
                return (
                  <motion.div
                    key={usp.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D6CFFF]/45 shadow-[0_2px_15px_rgba(23,21,31,0.02)] hover:shadow-[0_8px_25px_rgba(214,207,255,0.3)] hover:border-[#7464B8]/40 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#17151F] text-[#D6CFFF] flex items-center justify-center mb-3 shadow-sm group-hover:bg-[#7464B8] group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="font-serif text-xs sm:text-[13px] font-semibold text-[#17151F] tracking-wider uppercase mb-1.5">
                        {usp.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                        {usp.desc}
                      </p>
                    </div>
                    <div className="pt-3 mt-3.5 border-t border-[#D6CFFF]/20 flex items-center gap-1.5 text-[10px] font-semibold text-[#7464B8]">
                      <Sparkles className="w-3 h-3 text-[#7464B8]" />
                      <span>Guaranteed Lifetime Finish</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
