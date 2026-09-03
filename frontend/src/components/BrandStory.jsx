import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function BrandStory() {
  return (
    <section className="py-24 bg-[#17151F] text-white relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#D6CFFF]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Visual Layering */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] border border-white/20 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80"
                alt="Heirloom Indian jewellery craftsmanship"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute bottom-8 left-8 right-8">
                <span className="text-[10px] tracking-[0.35em] text-[#D6CFFF] uppercase font-bold">
                  Handcrafted Heritage
                </span>
                <h4 className="font-serif text-2xl font-light text-white mt-1">
                  18K PVD Plating &bull; Ethical Freshwater Pearls
                </h4>
              </div>
            </div>

            {/* Floating Glass Stats Badge */}
            <div className="absolute -bottom-6 -right-4 sm:-right-8 glass-panel-dark p-4 sm:p-5 rounded-3xl border border-[#D6CFFF]/30 shadow-2xl backdrop-blur-2xl">
              <div className="text-2xl sm:text-3xl font-serif text-[#D6CFFF] font-light">
                50,000+
              </div>
              <p className="text-[11px] text-white/70 font-medium">Heirlooms Delivered Across India</p>
            </div>
          </motion.div>

          {/* Right Editorial Copy */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#D6CFFF] text-[11px] font-semibold uppercase tracking-widest border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Our Philosophy</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-light leading-[1.15] tracking-wide text-white">
              MORE THAN JEWELLERY. <br />
              <span className="italic font-normal text-[#D6CFFF]">IT'S YOUR SIGNATURE.</span>
            </h2>

            <div className="space-y-4 text-white/70 font-light text-sm sm:text-base leading-relaxed">
              <p>
                Ocean Jewel was born from a singular obsession: to create fine Indian jewellery that refuses to compromise between heirloom grandeur and everyday wearability.
              </p>
              <p>
                Traditional fashion jewellery turns black in months. Solid gold is too delicate for gym sessions and daily commutes. We engineered the perfect synthesis — 18K Real Gold molecularly fused with surgical steel.
              </p>
              <p className="text-white font-normal italic">
                "Elegant enough for grand Indian weddings. Minimal enough for everyday life."
              </p>
            </div>

            <div className="pt-4 flex items-center gap-6">
              <Link
                to="/about"
                className="px-8 py-3.5 bg-gradient-to-r from-[#D6CFFF] to-[#E8E3FF] text-[#17151F] font-semibold text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:opacity-95 transition-opacity btn-shine flex items-center gap-2"
              >
                <span>Read Our Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
