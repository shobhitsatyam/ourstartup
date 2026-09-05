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
        <section className="py-6 lg:py-7 bg-[#FAF9FF] relative overflow-hidden border-b border-[#D6CFFF]/25">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-xl mx-auto mb-4 lg:mb-5">
              <span className="text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-[0.35em] text-[#7464B8]">
                The Quality Benchmark
              </span>
              <h2 className="font-serif text-xl sm:text-2xl lg:text-[26px] font-light text-[#17151F] mt-0.5 tracking-tight">
                ENGINEERED TO NEVER FADE
              </h2>
            </div>

            {/* Sleek Compact Luxury Cards Grid — 4 Cards in ONE Horizontal Row */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {usps.map((usp, idx) => {
                const Icon = usp.icon;
                return (
                  <motion.div
                    key={usp.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    className="p-3.5 lg:p-4 rounded-xl lg:rounded-2xl bg-white border border-[#D6CFFF]/45 shadow-[0_2px_15px_rgba(23,21,31,0.02)] hover:shadow-[0_8px_25px_rgba(214,207,255,0.3)] hover:border-[#7464B8]/40 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg lg:rounded-xl bg-[#17151F] text-[#D6CFFF] flex items-center justify-center mb-2.5 shadow-sm group-hover:bg-[#7464B8] group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif text-[11px] lg:text-[12px] xl:text-[13px] font-semibold text-[#17151F] tracking-wider uppercase leading-snug">
                        {usp.title}
                      </h3>
                    </div>
                    <div className="pt-2.5 mt-2.5 border-t border-[#D6CFFF]/20 flex items-center gap-1.5 text-[9.5px] lg:text-[10px] font-semibold text-[#7464B8]">
                      <Sparkles className="w-3 h-3 text-[#7464B8] shrink-0" />
                      <span className="truncate">Guaranteed Lifetime Finish</span>
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
