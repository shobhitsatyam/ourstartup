import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Droplet, Heart, Award, ArrowRight } from 'lucide-react';
import TrustBadgeSection from '../components/TrustBadgeSection';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF9FF] py-12 space-y-20">
      {/* Hero Header */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#7464B8]">
          The Ocean Jewel Legacy
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#17151F] leading-tight">
          CRAFTED FOR ETERNITY. <br />
          <span className="italic font-normal text-[#7464B8]">DEFINED BY ELEGANCE.</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
          We believe fine jewellery should be worn every day, through every celebration, workout, and rainfall — without ever tarnishing or losing its golden luster.
        </p>
      </section>

      {/* Editorial Image Trio */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-lg border border-white/60">
            <img
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
              alt="Freshwater pearls"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-lg border border-white/60 md:-translate-y-6">
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
              alt="Temple Gold craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-lg border border-white/60">
            <img
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
              alt="18K Gold Cuban link chain"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* The Anti-Tarnish Science */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl p-8 sm:p-14 border border-[#D6CFFF]/60 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#7464B8]">
            Material Engineering
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#17151F] mt-1">
            THE PVD REVOLUTION
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-gray-600 font-light leading-relaxed">
          <div className="space-y-4">
            <h3 className="font-serif text-base font-semibold text-gray-900">Why Traditional Jewellery Fails</h3>
            <p>
              Standard gold-plated jewellery uses electroplating, which only deposits a micro-thin layer of gold (0.1 microns) on cheap base metals like nickel or zinc. Within weeks, sweat and perfume corrode this layer, causing green skin marks and black oxidation.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-base font-semibold text-gray-900">The Ocean Jewel Standard</h3>
            <p>
              We utilize vacuum-sealed <strong>Physical Vapor Deposition (PVD)</strong>. Real 18K gold is vaporized at high temperatures in a vacuum chamber and fused molecularly onto surgical grade 316L stainless steel. This creates a bond 10x stronger than standard plating that is completely immune to water, heat, and perspiration.
            </p>
          </div>
        </div>
      </section>

      {/* USPs */}
      <TrustBadgeSection />

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center pb-12 space-y-4">
        <h3 className="font-serif text-3xl font-light text-[#17151F]">
          EXPERIENCE THE LUXURY
        </h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Explore over 13 signature Indian categories crafted with zero tarnish guarantee.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#17151F] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-[#2A2635] shadow-xl btn-shine"
        >
          <span>Enter Showroom</span>
          <ArrowRight className="w-4 h-4 text-[#D6CFFF]" />
        </Link>
      </section>
    </div>
  );
}
